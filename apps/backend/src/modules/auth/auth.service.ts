import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto, VerifyRegistrationOtpDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailSenderService } from './mail-sender.service';
import { PortalScopeType } from './decorators/portal-scope.decorator';
import { getAccessTokenTtl, getRefreshTokenTtl } from '../../common/config/jwt.config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpStore = new Map<string, { otp: string; expiresAt: number; workEmail: string }>();
  private readonly pendingRegistrationStore = new Map<
    string,
    { dto: RegisterDto; otp: string; expiresAt: number }
  >();
  private readonly passwordResetStore = new Map<
    string,
    { otp: string; expiresAt: number; email: string }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailSender: MailSenderService,
  ) {}

  /**
   * Enterprise Multi-Tenant Scoped Token Generator
   * Issues short-lived Access Token (15m) + Long-lived Refresh Token (7d) strictly partitioned by Portal
   */
  public generateAuthTokens(user: any, requestedPortal?: PortalScopeType) {
    const roles: string[] = (user.roles || []).map((r: any) =>
      typeof r === 'string' ? r : r.role,
    );

    let portalScope: PortalScopeType = 'CONSUMER';

    if (requestedPortal === 'SUPER_ADMIN') {
      if (!roles.includes('SUPER_ADMIN')) {
        throw new ForbiddenException(
          'Super Administrator clearance is required to access this portal.',
        );
      }
      portalScope = 'SUPER_ADMIN';
    } else if (requestedPortal === 'COMPANY_ADMIN') {
      const isCompanyAdmin =
        roles.includes('COMPANY_ADMIN') ||
        (user.memberships &&
          user.memberships.some(
            (m: any) =>
              m.membershipStatus === 'ACTIVE' &&
              (m.companyRole === 'OWNER' || m.companyRole === 'ADMIN'),
          ));

      if (!isCompanyAdmin) {
        throw new ForbiddenException(
          'Company Administrator clearance is required to access this portal.',
        );
      }
      portalScope = 'COMPANY_ADMIN';
    } else if (requestedPortal === 'CONSUMER') {
      // The consumer portal is always consumer-scoped. Elevated roles must use
      // their dedicated portal so a SUPER_ADMIN token can never leak into /app.
      portalScope = 'CONSUMER';
    } else {
      // No explicit portal requested: preserve role-based default for internal callers.
      if (roles.includes('SUPER_ADMIN')) {
        portalScope = 'SUPER_ADMIN';
      } else if (roles.includes('COMPANY_ADMIN')) {
        portalScope = 'COMPANY_ADMIN';
      } else {
        portalScope = 'CONSUMER';
      }
    }

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        roles,
        portalScope,
        tokenType: 'ACCESS',
      },
      { expiresIn: getAccessTokenTtl() as any },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        portalScope,
        tokenType: 'REFRESH',
      },
      { expiresIn: getRefreshTokenTtl() as any },
    );

    return {
      token: accessToken, // Backward compatibility
      accessToken,
      refreshToken,
      portalScope,
      user: {
        id: user.id,
        email: user.email,
        roles,
        portalScope,
        profile: user.profile,
        onboardingCompleted: user.onboardingCompleted,
      },
    };
  }

  /**
   * Sandbox identity switching must be explicitly opt-in and can never run in production.
   */
  private assertAuthSandboxEnabled(action: string) {
    const enabled =
      process.env.ENABLE_AUTH_SANDBOX === 'true' && process.env.NODE_ENV !== 'production';
    if (!enabled) {
      throw new ForbiddenException(
        `${action} is disabled. Sandbox authentication requires ENABLE_AUTH_SANDBOX=true in a non-production environment.`,
      );
    }
  }

  /**
   * Development-only convenience: echoing OTPs in API responses is never allowed in production.
   */
  private shouldExposeDevOtp(): boolean {
    return process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEV_OTP === 'true';
  }

  async register(dto: RegisterDto) {
    // Account creation always goes through email OTP verification so nobody can
    // register an address they do not control.
    return this.registerInit(dto);
  }

  async registerInit(dto: RegisterDto) {
    if (!dto.agreeTerms) {
      throw new BadRequestException('You must accept the terms of service and privacy policy.');
    }

    const emailNormalized = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { emailNormalized },
    });

    if (existingUser) {
      const providerLabel =
        existingUser.authProvider === 'GOOGLE'
          ? 'Google Sign-In'
          : existingUser.authProvider === 'LINKEDIN'
          ? 'LinkedIn Sign-In'
          : 'password';
      throw new BadRequestException({
        statusCode: 400,
        error: 'EMAIL_ALREADY_EXISTS',
        message: `An account with this email is already registered using ${providerLabel}. Please sign in to continue.`,
        email: existingUser.email,
        authProvider: existingUser.authProvider || 'LOCAL',
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    this.pendingRegistrationStore.set(emailNormalized, {
      dto,
      otp,
      expiresAt,
    });

    try {
      await (this.prisma as any).authVerificationOtp.upsert({
        where: { emailNormalized },
        create: {
          email: dto.email.trim(),
          emailNormalized,
          otp,
          purpose: 'REGISTRATION',
          registrationData: dto as any,
          expiresAt: new Date(expiresAt),
        },
        update: {
          email: dto.email.trim(),
          otp,
          purpose: 'REGISTRATION',
          registrationData: dto as any,
          expiresAt: new Date(expiresAt),
        },
      });
    } catch (otpErr: any) {
      this.logger.warn(`Could not persist registration OTP to database (in-memory active): ${otpErr.message}`);
    }

    this.logger.log(`[AUTH-REGISTER-INIT] Generated registration OTP for ${emailNormalized}`);

    // Real-time email dispatch (SMTP or outbox)
    await this.mailSender.sendOtpEmail(
      dto.email.trim(),
      dto.name.trim(),
      otp,
      'REGISTRATION',
    );

    return {
      success: true,
      message: 'Verification OTP sent to your email. Enter the code below to complete registration.',
      email: dto.email.trim(),
      ...(this.shouldExposeDevOtp() ? { devOtp: otp } : {}),
    };
  }

  async verifyRegistrationOtp(dto: VerifyRegistrationOtpDto) {
    const emailNormalized = dto.email.trim().toLowerCase();
    let pending = this.pendingRegistrationStore.get(emailNormalized);

    if (!pending) {
      try {
        const dbOtp = await (this.prisma as any).authVerificationOtp.findUnique({
          where: { emailNormalized },
        });
        if (dbOtp && dbOtp.purpose === 'REGISTRATION') {
          pending = {
            dto: dbOtp.registrationData as RegisterDto,
            otp: dbOtp.otp,
            expiresAt: new Date(dbOtp.expiresAt).getTime(),
          };
        }
      } catch (dbOtpErr: any) {
        this.logger.warn(`Failed checking DB verification OTP: ${dbOtpErr.message}`);
      }
    }

    if (!pending) {
      throw new BadRequestException('No pending registration found for this email, or session expired. Please register again.');
    }

    if (pending.otp !== dto.otp) {
      throw new BadRequestException('Invalid OTP. Please check the code and try again.');
    }

    if (pending.expiresAt < Date.now()) {
      this.pendingRegistrationStore.delete(emailNormalized);
    try {
      await (this.prisma as any).authVerificationOtp.deleteMany({
        where: { emailNormalized, purpose: 'REGISTRATION' },
      });
    } catch {}
      throw new BadRequestException('Verification code expired. Please register again.');
    }

    if (!pending) {
      throw new BadRequestException('Registration details not found for verification. Please submit registration details first.');
    }

    const regDto = pending.dto;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(regDto.password, salt);

    const compName = regDto.companyName?.trim();
    const isIndependent = !compName || /^(independent|freelance|consultant|self-employed|none|n\/a)$/i.test(compName);
    const designation = regDto.designation?.trim() || 'Professional';
    const headline = isIndependent ? designation : `${designation} at ${compName}`;

    const newUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: regDto.email.trim(),
          emailNormalized,
          passwordHash,
          accountStatus: 'ACTIVE',
          emailVerifiedAt: new Date(),
          phoneNumber: regDto.mobile?.trim() || null,
          phoneVerified: true,
          onboardingStep: 1,
          onboardingCompleted: false,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          role: 'USER',
        },
      });

      let companyId: string | undefined;
      if (!isIndependent && compName) {
        const compNormalized = compName.toLowerCase();
        let company = await tx.company.findFirst({
          where: { normalizedName: compNormalized },
        });

        if (!company) {
          company = await tx.company.create({
            data: {
              name: compName,
              normalizedName: compNormalized,
              legalName: compName,
              domain: regDto.companyDomain?.trim().toLowerCase() || null,
              verificationStatus: 'UNVERIFIED',
              intakeStatus: 'OPEN',
            },
          });

          // Ownership is only granted for a company shell created by this registration.
          await tx.companyMembership.create({
            data: {
              companyId: company.id,
              userId: user.id,
              companyRole: 'OWNER',
              membershipStatus: 'ACTIVE',
            },
          });

          await tx.userRole.create({
            data: {
              userId: user.id,
              role: 'COMPANY_ADMIN',
            },
          });
        } else {
          // Never attach a new registration as OWNER of an existing company.
          // Record a pending claim instead so ownership must be proven separately.
          await tx.companyClaimRequest.create({
            data: {
              companyId: company.id,
              requestedByUserId: user.id,
              verificationMethod: 'DOMAIN_EMAIL',
              status: 'PENDING',
              reviewNotes:
                'Registration-time company affiliation pending ownership verification.',
            },
          });
        }

        companyId = company.id;
      }

      const profile = await tx.professionalProfile.create({
        data: {
          userId: user.id,
          displayName: regDto.name.trim(),
          currentTitle: designation,
          headline,
          phoneNumber: regDto.mobile?.trim() || null,
          currentCompanyId: companyId || null,
          completenessScore: 85,
          visibility: 'SIGNED_IN_ONLY',
          verificationStatus: 'UNVERIFIED',
        },
      });

      if (companyId && compName) {
        await tx.professionalExperience.create({
          data: {
            professionalProfileId: profile.id,
            companyName: compName,
            title: designation,
            isCurrent: true,
            startDate: new Date(),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED_OTP_VERIFIED',
          resource: 'USER',
          metadata: JSON.stringify({
            email: user.email,
            name: regDto.name,
            designation,
            companyName: compName,
            companyId,
          }),
        },
      });

      return { user, profile, companyId };
    });

    this.pendingRegistrationStore.delete(emailNormalized);

    const userRoles = newUser.companyId ? ['USER', 'COMPANY_ADMIN'] : ['USER'];
    const authResult = this.generateAuthTokens(
      {
        id: newUser.user.id,
        email: newUser.user.email,
        roles: userRoles,
        profile: newUser.profile,
        onboardingCompleted: false,
      },
      newUser.companyId ? 'COMPANY_ADMIN' : 'CONSUMER',
    );

    this.logger.log(`New verified user registered: ${newUser.user.email} (${designation})`);

    return {
      message: 'Account verified and registered successfully',
      ...authResult,
      companyId: newUser.companyId,
    };
  }

  async checkEmailAvailability(email?: string) {
    if (!email || !email.includes('@')) {
      return { registered: false, available: true };
    }
    const emailNormalized = email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { emailNormalized },
      select: { id: true, email: true, authProvider: true },
    });
    if (existing) {
      const providerLabel =
        existing.authProvider === 'GOOGLE'
          ? 'Google Sign-In'
          : existing.authProvider === 'LINKEDIN'
          ? 'LinkedIn Sign-In'
          : 'password';
      return {
        registered: true,
        available: false,
        email: existing.email,
        authProvider: existing.authProvider || 'LOCAL',
        providerLabel,
        message: `An account with this email is already registered using ${providerLabel}. Please sign in to continue.`,
      };
    }
    return { registered: false, available: true };
  }

  async login(dto: LoginDto) {
    const emailNormalized = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { emailNormalized },
      include: {
        roles: true,
        profile: true,
        memberships: {
          where: { membershipStatus: 'ACTIVE' },
          include: { company: true },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    if (user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not currently active');
    }

    const roles: string[] = (user.roles || []).map((r) => r.role);

    // Strict portal partition validation
    if (dto.targetPortal === 'SUPER_ADMIN') {
      if (!roles.includes('SUPER_ADMIN')) {
        throw new ForbiddenException({
          statusCode: 403,
          error: 'PORTAL_ACCESS_VIOLATION',
          message: 'ACCESS DENIED: Super Administrator clearance required.',
        });
      }
    } else if (dto.targetPortal === 'COMPANY_ADMIN') {
      const isCompanyAdmin =
        roles.includes('COMPANY_ADMIN') ||
        (user.memberships &&
          user.memberships.some(
            (m) => m.companyRole === 'OWNER' || m.companyRole === 'ADMIN',
          ));
      if (!isCompanyAdmin) {
        throw new ForbiddenException({
          statusCode: 403,
          error: 'PORTAL_ACCESS_VIOLATION',
          message: 'ACCESS DENIED: This portal is strictly isolated to Company Administrators.',
        });
      }
    } else if (dto.targetPortal === 'CONSUMER') {
      if (roles.includes('SUPER_ADMIN')) {
        throw new ForbiddenException({
          statusCode: 403,
          error: 'PORTAL_ACCESS_VIOLATION',
          message: 'ACCESS DENIED: Super Administrators must sign in through the Admin Ops portal at /admin/login.',
        });
      }
      if (roles.includes('COMPANY_ADMIN')) {
        throw new ForbiddenException({
          statusCode: 403,
          error: 'PORTAL_ACCESS_VIOLATION',
          message: 'ACCESS DENIED: Company Administrators must sign in through the Company Portal at /company/login.',
        });
      }
    }

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`User logged in: ${user.email} (${user.id}) [Target Portal: ${dto.targetPortal || 'AUTO'}]`);

    const authTokens = this.generateAuthTokens(user, dto.targetPortal);

    return {
      message: 'Login successful',
      ...authTokens,
    };
  }

  /**
   * Google Single Sign-On Authentication
   */
  async googleLogin(googleUser: {
    email?: string;
    googleId?: string;
    displayName?: string;
    avatarUrl?: string;
    idToken?: string;
  }) {
    if (!googleUser?.idToken || !googleUser.idToken.trim()) {
      throw new UnauthorizedException(
        'A Google ID token is required to sign in with Google. Client-supplied email addresses are not accepted.',
      );
    }

    const claims = await this.verifyGoogleIdToken(googleUser.idToken);
    return this.loginOrRegisterGoogleUser({
      email: claims.email,
      googleId: claims.sub,
      displayName: claims.name,
      avatarUrl: claims.picture,
    });
  }

  /**
   * Verifies a Google-issued ID token (signature, expiry, issuer and audience) before trusting any claim.
   */
  private async verifyGoogleIdToken(idToken: string): Promise<{
    email: string;
    sub: string;
    name?: string;
    picture?: string;
  }> {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId || clientId.includes('placeholder') || clientId.includes('your_google')) {
      throw new ServiceUnavailableException('Google Sign-In is not configured on this server.');
    }

    let payload: any;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);
      if (!res.ok) {
        throw new Error(`Google token verification rejected the token (HTTP ${res.status})`);
      }
      payload = await res.json();
    } catch (err: any) {
      this.logger.warn(`Google ID token verification failed: ${err?.message || 'network error'}`);
      throw new UnauthorizedException('Google ID token could not be verified.');
    }

    const issuer = payload?.iss;
    if (issuer !== 'accounts.google.com' && issuer !== 'https://accounts.google.com') {
      throw new UnauthorizedException('Google ID token has an invalid issuer.');
    }
    if (payload?.aud !== clientId) {
      throw new UnauthorizedException('Google ID token was issued for a different application.');
    }
    if (String(payload?.email_verified) !== 'true') {
      throw new UnauthorizedException('Google account email address is not verified.');
    }
    if (!payload?.email) {
      throw new UnauthorizedException('Google account did not expose an email address.');
    }
    if (payload?.exp && Number(payload.exp) * 1000 <= Date.now()) {
      throw new UnauthorizedException('Google ID token has expired.');
    }

    return {
      email: String(payload.email).trim().toLowerCase(),
      sub: String(payload.sub || ''),
      name: payload.name,
      picture: payload.picture,
    };
  }

  /**
   * Creates or resumes a local account from identity claims that have already been verified by Google.
   */
  private async loginOrRegisterGoogleUser(googleUser: {
    email: string;
    googleId?: string;
    displayName?: string;
    avatarUrl?: string;
  }) {
    const email = googleUser.email.trim().toLowerCase();
    const googleId = googleUser.googleId;
    const displayName = googleUser.displayName;
    const avatarUrl = googleUser.avatarUrl;

    if (!email) {
      throw new BadRequestException('A valid Google email address is required');
    }

    const emailNormalized = email;
    let isNewUser = false;

    let user = await this.prisma.user.findUnique({
      where: { emailNormalized },
      include: {
        roles: true,
        profile: true,
      },
    });

    if (!user) {
      isNewUser = true;
      // First time Google SSO user -> create user and profile
      user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            emailNormalized,
            googleId: googleId || null,
            avatarUrl: avatarUrl || null,
            authProvider: 'GOOGLE',
            accountStatus: 'ACTIVE',
            emailVerifiedAt: new Date(),
            onboardingCompleted: false, // First time Google signup: must complete onboarding
          },
        });

        await tx.userRole.create({
          data: {
            userId: newUser.id,
            role: 'USER',
          },
        });

        const newProfile = await tx.professionalProfile.create({
          data: {
            userId: newUser.id,
            displayName: displayName || email.split('@')[0],
            avatarUrl: avatarUrl || null,
            visibility: 'PUBLIC',
            verificationStatus: 'VERIFIED',
          },
        });

        return {
          ...newUser,
          roles: [{ role: 'USER' }],
          profile: newProfile,
        } as any;
      });
    } else {
      // Existing user -> ensure googleId, fresh avatar, verified email, and authProvider are stored
      const updates: any = {};
      if (googleId && user.googleId !== googleId) {
        updates.googleId = googleId;
      }
      if (user.authProvider !== 'GOOGLE') {
        updates.authProvider = 'GOOGLE';
      }
      if (avatarUrl && user.avatarUrl !== avatarUrl) {
        updates.avatarUrl = avatarUrl;
      }
      if (!user.emailVerifiedAt) {
        updates.emailVerifiedAt = new Date();
        // The account predates verified email ownership. Google has now proven ownership,
        // so invalidate any password that may have been set by whoever pre-registered it.
        if (user.passwordHash) {
          updates.passwordHash = null;
        }
      }

      if (Object.keys(updates).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updates,
          include: {
            roles: true,
            profile: true,
          },
        });
      }

      // Always sync fresh Google avatar & verified badge to professional profile
      if (user.profile) {
        const profileUpdates: any = {};
        if (avatarUrl && user.profile.avatarUrl !== avatarUrl) {
          profileUpdates.avatarUrl = avatarUrl;
        }
        if (displayName && (!user.profile.displayName || user.profile.displayName === 'Srikanth' || user.profile.displayName.includes('@'))) {
          profileUpdates.displayName = displayName;
        }
        if (user.profile.verificationStatus !== 'VERIFIED') {
          profileUpdates.verificationStatus = 'VERIFIED';
        }

        if (Object.keys(profileUpdates).length > 0) {
          const updatedProfile = await this.prisma.professionalProfile.update({
            where: { id: user.profile.id },
            data: profileUpdates,
          });
          user.profile = updatedProfile;
        }
      }
    }

    if (user.accountStatus === 'SUSPENDED') {
      throw new UnauthorizedException('Your account has been suspended. Please contact platform administration.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`Google SSO authenticated: ${user.email} (${user.id}) - isNewUser: ${isNewUser}`);

    const authTokens = this.generateAuthTokens(user, 'CONSUMER');

    return {
      message: isNewUser ? 'Google registration successful' : 'Google authentication successful',
      isNewUser,
      onboardingCompleted: user.onboardingCompleted,
      ...authTokens,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const emailNormalized = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { emailNormalized },
      include: { profile: true },
    });

    if (!user) {
      // Safe generic message so we don't leak user registration status
      return {
        success: true,
        message: 'If an account exists with that email, a 6-digit password reset code has been sent. It expires in 10 minutes.',
        expiresInMinutes: 10,
      };
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // Strictly 10 minutes expiry

    this.passwordResetStore.set(emailNormalized, {
      otp,
      expiresAt,
      email: user.email,
    });

    try {
      await (this.prisma as any).authVerificationOtp.upsert({
        where: { emailNormalized },
        create: {
          email: user.email,
          emailNormalized,
          otp,
          purpose: 'PASSWORD_RESET',
          expiresAt: new Date(expiresAt),
        },
        update: {
          email: user.email,
          otp,
          purpose: 'PASSWORD_RESET',
          expiresAt: new Date(expiresAt),
        },
      });
    } catch (resetErr: any) {
      this.logger.warn(`Could not persist password reset OTP to database: ${resetErr.message}`);
    }

    this.logger.log(`[AUTH-FORGOT-PASSWORD] Generated 10-minute reset OTP for ${emailNormalized}`);

    // Real-time email dispatch (SMTP or outbox fallback)
    const recipientName = user.profile?.displayName || 'Executive';
    await this.mailSender.sendOtpEmail(user.email, recipientName, otp, 'PASSWORD_RESET');

    return {
      success: true,
      message: 'A 6-digit recovery code has been dispatched to your email. It expires in 10 minutes.',
      email: user.email,
      expiresInMinutes: 10,
      ...(this.shouldExposeDevOtp() ? { devOtp: otp } : {}),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const emailNormalized = dto.email.trim().toLowerCase();
    let resetEntry = this.passwordResetStore.get(emailNormalized);

    if (!resetEntry) {
      try {
        const dbOtp = await (this.prisma as any).authVerificationOtp.findUnique({
          where: { emailNormalized },
        });
        if (dbOtp && dbOtp.purpose === 'PASSWORD_RESET') {
          resetEntry = {
            otp: dbOtp.otp,
            expiresAt: new Date(dbOtp.expiresAt).getTime(),
            email: dbOtp.email,
          };
        }
      } catch (dbErr: any) {
        this.logger.warn(`Failed reading password reset OTP from DB: ${dbErr.message}`);
      }
    }

    if (!resetEntry) {
      throw new BadRequestException('No pending password reset found for this email, or the code has expired. Please request a new code.');
    }

    if (resetEntry.otp !== dto.otp) {
      throw new BadRequestException('Invalid 6-digit recovery code. Please check your email and try again.');
    }

    if (resetEntry.expiresAt < Date.now()) {
      this.passwordResetStore.delete(emailNormalized);
    try {
      await (this.prisma as any).authVerificationOtp.deleteMany({
        where: { emailNormalized, purpose: 'PASSWORD_RESET' },
      });
    } catch {}
      throw new BadRequestException('Password reset code has expired (10-minute window passed). Please request a new code.');
    }

    const user = await this.prisma.user.findUnique({
      where: { emailNormalized },
    });

    if (!user) {
      throw new BadRequestException('User account not found.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    this.passwordResetStore.delete(emailNormalized);

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_COMPLETED',
        resource: 'USER',
        metadata: JSON.stringify({ email: user.email, at: new Date().toISOString() }),
      },
    });

    this.logger.log(`[PASSWORD-RESET-SUCCESS] Password updated for ${emailNormalized}. Requiring fresh login.`);

    return {
      success: true,
      message: 'Your password has been successfully updated. Please sign in with your new credentials.',
      requireLogin: true,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        profile: {
          include: {
            experiences: true,
            expertise: true,
            intents: true,
          },
        },
        memberships: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber || user.profile?.phoneNumber || null,
      phoneVerified: user.phoneVerified,
      roles: user.roles.map((r) => r.role),
      profile: user.profile,
      memberships: user.memberships,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
    };
  }

  /**
   * Phase 2: Construct Google OAuth 2.0 Authorization Redirect URL
   */
  private normalizeGoogleRedirectUri(redirectUri?: string): string {
    const defaultRedirect =
      process.env.NODE_ENV === 'production'
        ? (process.env.GOOGLE_REDIRECT_URI || 'https://meshvi.org/auth/google/callback')
        : (process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3100/auth/google/callback');

    let uri = (redirectUri && redirectUri.trim()) ? redirectUri.trim() : defaultRedirect;

    // Strip trailing slash
    if (uri.endsWith('/')) {
      uri = uri.slice(0, -1);
    }

    // Normalize www.meshvi.org to canonical meshvi.org to match Google Cloud Console whitelist
    if (uri.includes('www.meshvi.org/auth/google/callback')) {
      uri = uri.replace('www.meshvi.org', 'meshvi.org');
    }

    return uri;
  }

  getGoogleAuthUrl(state?: string, redirectUri?: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || '';
    if (!clientId || clientId.includes('placeholder') || clientId.includes('your_google')) {
      throw new ServiceUnavailableException(
        'Google Sign-In is not configured on this server. Please contact the administrator.',
      );
    }
    const effectiveRedirectUri = this.normalizeGoogleRedirectUri(redirectUri);
    const effectiveState = state || Math.random().toString(36).substring(2, 15);

    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      effectiveRedirectUri,
    )}&scope=openid%20profile%20email&state=${effectiveState}&access_type=offline&prompt=select_account`;

    return {
      url,
      state: effectiveState,
      clientId,
      redirectUri: effectiveRedirectUri,
    };
  }

  /**
   * Phase 2: Handle Google OAuth 2.0 Callback & Exchange Code
   */
  async handleGoogleCallback(code: string, state?: string, redirectUri?: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const effectiveRedirectUri = this.normalizeGoogleRedirectUri(redirectUri);

    if (
      !clientId ||
      !clientSecret ||
      clientId.includes('placeholder') ||
      clientSecret.includes('placeholder')
    ) {
      throw new ServiceUnavailableException(
        'Google Sign-In is not configured on this server. Please contact the administrator.',
      );
    }

    if (!code) {
      throw new BadRequestException('Google authorization code is required.');
    }

    try {
      // 1. Exchange the authorization code for Google tokens (server-to-server)
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: effectiveRedirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || (!tokenData.id_token && !tokenData.access_token)) {
        this.logger.error(`[GOOGLE_OAUTH_EXCHANGE_ERROR] Redirect URI used: "${effectiveRedirectUri}". Details: ${JSON.stringify(tokenData)}`);
        throw new BadRequestException(
          tokenData.error_description || tokenData.error || `Failed to exchange Google authorization code (Redirect URI: ${effectiveRedirectUri})`,
        );
      }

      let claims: { email: string; sub: string; name?: string; picture?: string };

      if (tokenData.id_token) {
        // Preferred path: cryptographically verify the Google ID token.
        claims = await this.verifyGoogleIdToken(tokenData.id_token);
      } else {
        // Fallback: the access token was issued to this server by Google, so userinfo is trusted.
        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        if (!userinfoRes.ok) {
          throw new UnauthorizedException('Google did not return a valid user profile.');
        }
        const googleUser = await userinfoRes.json();
        if (!googleUser?.email) {
          throw new UnauthorizedException('Google account did not expose an email address.');
        }
        if (googleUser.email_verified === false) {
          throw new UnauthorizedException('Google account email address is not verified.');
        }
        claims = {
          email: String(googleUser.email).trim().toLowerCase(),
          sub: String(googleUser.sub || ''),
          name: googleUser.name,
          picture: googleUser.picture,
        };
      }

      return this.loginOrRegisterGoogleUser({
        email: claims.email,
        googleId: claims.sub,
        displayName: claims.name,
        avatarUrl: claims.picture,
      });
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.logger.error(`Google OAuth exchange error: ${err.message}`);
      throw new BadRequestException(err.message || 'Google authorization failed');
    }
  }

  /**
   * Phase 2: Construct LinkedIn OIDC Authorization Redirect URL
   */
  getLinkedInAuthUrl(state?: string, redirectUri?: string) {
    const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();
    if (!clientId || clientId.includes('placeholder') || clientId === 'setu_linkedin_dev_app') {
      throw new ServiceUnavailableException(
        'LinkedIn Sign-In is not configured on this server. Please contact the administrator.',
      );
    }
    const defaultRedirect =
      process.env.NODE_ENV === 'production'
        ? 'https://meshvi.org/auth/linkedin/callback'
        : 'http://localhost:3100/auth/linkedin/callback';
    const effectiveRedirectUri =
      redirectUri || process.env.LINKEDIN_REDIRECT_URI || defaultRedirect;
    const effectiveState = state || Math.random().toString(36).substring(2, 15);

    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      effectiveRedirectUri,
    )}&state=${effectiveState}&scope=openid%20profile%20email`;

    return {
      url,
      state: effectiveState,
      clientId,
      redirectUri: effectiveRedirectUri,
    };
  }

  /**
   * Phase 2: Handle LinkedIn OIDC Callback & Exchange Code
   */
  async handleLinkedInCallback(code: string, state?: string, redirectUri?: string) {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const defaultRedirect =
      process.env.NODE_ENV === 'production'
        ? 'https://meshvi.org/auth/linkedin/callback'
        : 'http://localhost:3100/auth/linkedin/callback';
    const effectiveRedirectUri =
      redirectUri || process.env.LINKEDIN_REDIRECT_URI || defaultRedirect;

    // Live credentials are mandatory — never fabricate an identity in place of a failed handshake.
    if (
      !clientId ||
      clientId.includes('placeholder') ||
      !clientSecret ||
      clientSecret.includes('placeholder')
    ) {
      throw new ServiceUnavailableException(
        'LinkedIn Sign-In is not configured on this server. Please contact the administrator.',
      );
    }

    try {
      // 1. Exchange code for access token
      const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: effectiveRedirectUri,
        }).toString(),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new BadRequestException(
          tokenData.error_description || 'Failed to exchange LinkedIn authorization code.',
        );
      }

      // 2. Fetch UserInfo with resilient claims extraction
      let userInfo: any = null;
      try {
        const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        if (userinfoRes.ok) {
          userInfo = await userinfoRes.json();
        } else {
          this.logger.warn(`LinkedIn userinfo returned HTTP status ${userinfoRes.status}`);
        }
      } catch (err: any) {
        this.logger.warn(`Could not reach LinkedIn /v2/userinfo: ${err.message}`);
      }

      let sub = userInfo?.sub || userInfo?.id;
      let email = userInfo?.email;
      let displayName =
        userInfo?.name ||
        `${userInfo?.given_name || ''} ${userInfo?.family_name || ''}`.trim() ||
        null;
      let avatarUrl = userInfo?.picture || null;

      // Extract from tokenData.id_token if present (Standard OpenID Connect JWT)
      if (tokenData.id_token) {
        try {
          const decoded: any = this.jwtService.decode(tokenData.id_token);
          if (decoded) {
            sub = sub || decoded.sub || decoded.id;
            email = email || decoded.email;
            displayName =
              displayName ||
              decoded.name ||
              `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim();
            avatarUrl = avatarUrl || decoded.picture;
          }
        } catch (e: any) {
          this.logger.warn(`Could not decode LinkedIn id_token: ${e.message}`);
        }
      }

      // Never fabricate an identity: require a stable subject and a verified email from LinkedIn.
      if (!sub) {
        throw new UnauthorizedException(
          'LinkedIn did not return a stable user identifier. Please try again or use another sign-in method.',
        );
      }
      if (!email || !String(email).includes('@')) {
        throw new UnauthorizedException(
          'LinkedIn did not share a verified email address. Grant the email permission and try again.',
        );
      }

      return this.loginOrRegisterLinkedInUser({
        email: String(email),
        linkedinId: sub,
        displayName: displayName || 'LinkedIn Member',
        avatarUrl,
        headline: userInfo?.headline || 'Verified LinkedIn Professional',
        linkedinProfileUrl: `https://www.linkedin.com/in/${sub}`,
      });
    } catch (err: any) {
      this.logger.error(`LinkedIn OIDC exchange error: ${err.message}`);
      throw new BadRequestException(err.message || 'LinkedIn authorization failed');
    }
  }

  /**
   * Phase 2: Login or Register User from LinkedIn Identity Bundle
   */
  async loginOrRegisterLinkedInUser(linkedInUser: {
    email: string;
    linkedinId: string;
    displayName: string;
    avatarUrl?: string | null;
    headline?: string | null;
    linkedinProfileUrl?: string | null;
  }) {
    const emailNormalized = linkedInUser.email.trim().toLowerCase();

    // Check if user exists by linkedinId OR emailNormalized
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ linkedinId: linkedInUser.linkedinId }, { emailNormalized }],
      },
      include: {
        roles: true,
        profile: true,
      },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: linkedInUser.email.trim(),
            emailNormalized,
            linkedinId: linkedInUser.linkedinId,
            avatarUrl: linkedInUser.avatarUrl || null,
            linkedinProfileUrl: linkedInUser.linkedinProfileUrl || null,
            authProvider: 'LINKEDIN',
            accountStatus: 'ACTIVE',
            emailVerifiedAt: new Date(),
            linkedinVerified: true,
            onboardingStep: 3, // Advances directly to Step 3 (Prefilled review)
            onboardingCompleted: false,
          },
        });

        await tx.userRole.create({
          data: {
            userId: newUser.id,
            role: 'USER',
          },
        });

        const newProfile = await tx.professionalProfile.create({
          data: {
            userId: newUser.id,
            displayName: linkedInUser.displayName,
            headline: linkedInUser.headline || null,
            avatarUrl: linkedInUser.avatarUrl || null,
            linkedinUrl: linkedInUser.linkedinProfileUrl || null,
            visibility: 'SIGNED_IN_ONLY',
            verificationStatus: 'VERIFIED',
            isLinkedInVerified: true,
            completenessScore: 35, // 35% with verified identity, name & photo
          },
        });

        return {
          ...newUser,
          roles: [{ role: 'USER' }],
          profile: newProfile,
        } as any;
      });
    } else {
      // Existing user: link linkedinId & update verified badge
      user = await this.prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            linkedinId: linkedInUser.linkedinId,
            linkedinVerified: true,
            avatarUrl: linkedInUser.avatarUrl || user.avatarUrl,
            lastLoginAt: new Date(),
            ...(user.emailVerifiedAt
              ? {}
              : { emailVerifiedAt: new Date(), passwordHash: null }),
          },
          include: {
            roles: true,
            profile: true,
          },
        });

        if (updatedUser.profile) {
          await tx.professionalProfile.update({
            where: { id: updatedUser.profile.id },
            data: {
              isLinkedInVerified: true,
              avatarUrl: linkedInUser.avatarUrl || updatedUser.profile.avatarUrl,
              displayName: updatedUser.profile.displayName || linkedInUser.displayName,
              headline: updatedUser.profile.headline || linkedInUser.headline || null,
            },
          });
        }

        return updatedUser;
      });
    }

    if (user.accountStatus === 'SUSPENDED') {
      throw new UnauthorizedException(
        'Your account has been suspended. Please contact platform administration.',
      );
    }

    const authTokens = this.generateAuthTokens(user, 'CONSUMER');

    this.logger.log(`LinkedIn OIDC user authenticated: ${user.email} (${user.id})`);

    return {
      message: isNewUser
        ? 'LinkedIn account registered and pre-filled'
        : 'LinkedIn login successful',
      isNewUser,
      onboardingStep: user.onboardingStep || 3,
      ...authTokens,
    };
  }

  /**
   * Phase 2: High-Fidelity LinkedIn OIDC Sandbox Login
   */
  async linkedinSandboxLogin(customProfile?: {
    email?: string;
    displayName?: string;
    avatarUrl?: string;
    headline?: string;
    linkedinId?: string;
  }) {
    this.assertAuthSandboxEnabled('LinkedIn sandbox login');
    const sandboxEmail = customProfile?.email || 'priya.sharma@borneoagro.my';
    const sandboxName = customProfile?.displayName || 'Priya Sharma';
    const sandboxAvatar =
      customProfile?.avatarUrl ||
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80';
    const sandboxHeadline =
      customProfile?.headline || 'VP of Commercial Alliances & Regional Distribution';
    const sandboxLinkedinId =
      customProfile?.linkedinId ||
      'li_sandbox_' + Buffer.from(sandboxEmail).toString('hex').slice(0, 10);

    return this.loginOrRegisterLinkedInUser({
      email: sandboxEmail,
      displayName: sandboxName,
      avatarUrl: sandboxAvatar,
      headline: sandboxHeadline,
      linkedinId: sandboxLinkedinId,
      linkedinProfileUrl: `https://www.linkedin.com/in/${sandboxName
        .toLowerCase()
        .replace(/\s+/g, '-')}`,
    });
  }

  /**
   * Enterprise Multi-Tenant Refresh Token Exchange
   * Exchanges a valid refresh token for a newly scoped 15-minute access token
   */
  async refreshAccessToken(
    refreshTokenStr: string,
    targetPortal?: PortalScopeType,
  ) {
    if (!refreshTokenStr) {
      throw new BadRequestException('Refresh token is required');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshTokenStr);
    } catch {
      throw new UnauthorizedException('Refresh token is expired or invalid');
    }

    if (payload.tokenType !== 'REFRESH') {
      throw new UnauthorizedException('Invalid token type. Only refresh tokens can be exchanged.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: true,
        profile: true,
        memberships: {
          where: { membershipStatus: 'ACTIVE' },
          include: { company: true },
        },
      },
    });

    if (!user || user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedException('User account is invalid or suspended');
    }

    const roles: string[] = (user.roles || []).map((r) => r.role);
    const requestedScope = targetPortal || payload.portalScope;

    if (requestedScope === 'SUPER_ADMIN' && !roles.includes('SUPER_ADMIN')) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'PORTAL_ACCESS_VIOLATION',
        message: 'Security Violation: Cannot refresh token into SUPER_ADMIN portal without verified clearance.',
      });
    }

    if (
      requestedScope === 'COMPANY_ADMIN' &&
      !roles.includes('COMPANY_ADMIN') &&
      !(
        user.memberships &&
        user.memberships.some(
          (m) => m.companyRole === 'OWNER' || m.companyRole === 'ADMIN',
        )
      )
    ) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'PORTAL_ACCESS_VIOLATION',
        message: 'Security Violation: Cannot refresh token into COMPANY_ADMIN portal without verified clearance.',
      });
    }

    if (requestedScope === 'CONSUMER' && roles.includes('SUPER_ADMIN')) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'PORTAL_ACCESS_VIOLATION',
        message: 'Security Violation: Super Administrators cannot access CONSUMER portal.',
      });
    }

    if (requestedScope === 'CONSUMER' && roles.includes('COMPANY_ADMIN')) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'PORTAL_ACCESS_VIOLATION',
        message: 'Security Violation: Company Administrators cannot access CONSUMER portal.',
      });
    }

    const authTokens = this.generateAuthTokens(user, requestedScope);

    return {
      message: 'Token refreshed successfully',
      ...authTokens,
    };
  }

  /**
   * Phase 2: Request 6-digit OTP code for corporate work email verification
   */
  async requestWorkEmailOtp(userId: string, workEmail: string) {
    if (!workEmail || !workEmail.includes('@')) {
      throw new BadRequestException('A valid corporate work email is required.');
    }

    const domain = workEmail.split('@')[1].toLowerCase().trim();
    const publicDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
      'mail.com',
      'zoho.com',
      'protonmail.com',
    ];
    if (publicDomains.includes(domain)) {
      throw new BadRequestException(
        'Personal webmail providers cannot be used for Tier-2 Corporate Work Email verification. Please provide your official company email.',
      );
    }

    // Generate 6-digit cryptographic-like OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    this.otpStore.set(userId, { otp, expiresAt, workEmail: workEmail.toLowerCase().trim() });

    await this.mailSender.sendVerificationCodeEmail(
      workEmail.toLowerCase().trim(),
      workEmail.split('@')[0],
      otp,
      { expiryMinutes: 15, purposeLabel: 'Corporate work email verification' },
    );

    this.logger.log(`[WORK_EMAIL_OTP] Dispatched verification code for user ${userId} (${workEmail})`);

    return {
      success: true,
      message: `A 6-digit cryptographic verification code has been dispatched to ${workEmail}.`,
      expiresInMinutes: 15,
      ...(this.shouldExposeDevOtp() ? { devOtp: otp } : {}),
    };
  }

  /**
   * Phase 2 / Phase 3: Tier-2 Corporate Work Email Verification & Automated Domain Claiming
   */
  async verifyWorkEmail(userId: string, workEmail: string, otp?: string) {
    if (!workEmail || !workEmail.includes('@')) {
      throw new BadRequestException('A valid corporate work email is required.');
    }

    const domain = workEmail.split('@')[1].toLowerCase().trim();
    const publicDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
      'mail.com',
      'zoho.com',
      'protonmail.com',
    ];
    if (publicDomains.includes(domain)) {
      throw new BadRequestException(
        'Personal webmail providers cannot be used for Tier-2 Corporate Work Email verification. Please provide your official company email.',
      );
    }

    // A code sent to the corporate mailbox is mandatory — email ownership cannot be asserted.
    const stored = this.otpStore.get(userId);
    if (!otp) {
      throw new BadRequestException(
        'Enter the 6-digit verification code sent to your corporate email address.',
      );
    }
    if (!stored || stored.otp !== otp || stored.expiresAt <= Date.now()) {
      throw new BadRequestException(
        'Invalid or expired 6-digit verification code. Please request a new code.',
      );
    }
    if (stored.workEmail && stored.workEmail !== workEmail.trim().toLowerCase()) {
      throw new BadRequestException(
        'This verification code was issued for a different email address. Please request a new code.',
      );
    }
    this.otpStore.delete(userId);

    // Update user verification
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        workEmailVerified: true,
        workEmail: workEmail.trim().toLowerCase(),
      },
      include: {
        profile: true,
      },
    });

    // Match corporate domain against Company registry
    const matchingCompany = await this.prisma.company.findFirst({
      where: {
        OR: [
          { domain: { equals: domain, mode: 'insensitive' } },
          { verifiedDomains: { some: { domain: { equals: domain, mode: 'insensitive' } } } },
        ],
      },
    });

    let updatedProfile = user.profile;
    if (user.profile) {
      const profileUpdates: any = {
        isWorkEmailVerified: true,
        verificationStatus: 'VERIFIED',
        completenessScore: Math.min(100, (user.profile.completenessScore || 20) + 25),
      };

      if (matchingCompany && !user.profile.currentCompanyId) {
        profileUpdates.currentCompanyId = matchingCompany.id;
      }

      updatedProfile = await this.prisma.professionalProfile.update({
        where: { id: user.profile.id },
        data: profileUpdates,
        include: { company: true },
      });

      // Automatically affiliate active membership if matching company exists and no membership yet
      if (matchingCompany) {
        await this.prisma.companyMembership.upsert({
          where: {
            companyId_userId: {
              companyId: matchingCompany.id,
              userId: user.id,
            },
          },
          update: {
            membershipStatus: 'ACTIVE',
          },
          create: {
            companyId: matchingCompany.id,
            userId: user.id,
            companyRole: 'MEMBER',
            membershipStatus: 'ACTIVE',
            maxOpenBridges: 15,
          },
        });
      }
    }

    return {
      success: true,
      message: `Corporate email ${workEmail} verified successfully. Tier-2 Corporate Trust Badge unlocked${
        matchingCompany ? ` and affiliated with ${matchingCompany.name}` : ''
      }.`,
      domain,
      company: matchingCompany ? { id: matchingCompany.id, name: matchingCompany.name } : null,
      profile: updatedProfile,
    };
  }

  /**
   * Phase 2 / Phase 3: Tier-4 Role & Designation Confirmation
   */
  async confirmRole(adminUserId: string, targetProfileId: string, title: string, companyName?: string) {
    const targetProfile = await this.prisma.professionalProfile.findUnique({
      where: { id: targetProfileId },
    });

    if (!targetProfile) {
      throw new BadRequestException('Target executive profile not found.');
    }

    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      include: { roles: true },
    });

    const isCompanyAdmin = admin?.roles.some(
      (r) => r.role === 'COMPANY_ADMIN' || r.role === 'SUPER_ADMIN',
    );
    if (!isCompanyAdmin) {
      throw new UnauthorizedException(
        'Only verified Company Administrators can attest to commercial roles.',
      );
    }

    const updated = await this.prisma.professionalProfile.update({
      where: { id: targetProfileId },
      data: {
        isRoleConfirmed: true,
        roleConfirmedBy: admin.email,
        roleConfirmedAt: new Date(),
        currentTitle: title || targetProfile.currentTitle,
        verificationStatus: 'VERIFIED',
        completenessScore: Math.min(100, (targetProfile.completenessScore || 20) + 25),
      },
    });

    return {
      success: true,
      message: `Role "${title}" cryptographically confirmed by corporate admin. Tier-4 Attestation active.`,
      profile: updated,
    };
  }
}
