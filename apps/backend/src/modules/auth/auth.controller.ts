import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, VerifyRegistrationOtpDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication & Identity Verification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user and create draft professional profile' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Email already exists or invalid payload' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register-init')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate registration: validate details and dispatch verification OTP' })
  @ApiResponse({ status: 200, description: 'OTP generated and returned for verification' })
  @ApiResponse({ status: 400, description: 'Email already exists or invalid payload' })
  async registerInit(@Body() dto: RegisterDto) {
    return this.authService.registerInit(dto);
  }

  @Post('verify-registration-otp')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Verify email OTP and create user, role and company profile' })
  @ApiResponse({ status: 201, description: 'Registration completed and tokens generated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyRegistrationOtp(@Body() dto: VerifyRegistrationOtpDto) {
    return this.authService.verifyRegistrationOtp(dto);
  }

  @Get('check-email')
  @ApiOperation({ summary: 'Check if an email address is already registered' })
  async checkEmail(@Query('email') email: string) {
    return this.authService.checkEmailAvailability(email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange valid refresh token for a newly scoped short-lived access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Refresh token expired or invalid' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(dto.refreshToken, dto.targetPortal);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate or register user via Google SSO token' })
  @ApiResponse({ status: 200, description: 'Google SSO successful' })
  async googleLogin(
    @Body()
    body: {
      email?: string;
      googleId?: string;
      displayName?: string;
      avatarUrl?: string;
      idToken?: string;
    },
  ) {
    return this.authService.googleLogin(body);
  }

  @Get('google/url')
  @ApiOperation({ summary: 'Initiate Google OAuth 2.0 authorization redirect URL' })
  @ApiResponse({ status: 200, description: 'Authorization URL generated' })
  async googleRedirect(
    @Query('state') state?: string,
    @Query('redirectUri') redirectUri?: string,
  ) {
    return this.authService.getGoogleAuthUrl(state, redirectUri);
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth 2.0 authorization code callback via GET' })
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state?: string,
    @Query('redirectUri') redirectUri?: string,
  ) {
    return this.authService.handleGoogleCallback(code, state, redirectUri);
  }

  @Post('google/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange Google authorization code for Setu JWT session' })
  async googleToken(
    @Body() body: { code: string; redirectUri?: string; state?: string },
  ) {
    return this.authService.handleGoogleCallback(body.code, body.state, body.redirectUri);
  }

  /**
   * Phase 2: LinkedIn OIDC Authorization Redirect URL
   */
  @Get('linkedin')
  @ApiOperation({ summary: 'Initiate LinkedIn OpenID Connect authorization redirect' })
  @ApiResponse({ status: 200, description: 'Authorization URL generated' })
  async linkedinRedirect(
    @Query('state') state?: string,
    @Query('redirectUri') redirectUri?: string,
  ) {
    return this.authService.getLinkedInAuthUrl(state, redirectUri);
  }

  /**
   * Phase 2: LinkedIn OIDC Code Exchange (GET callback)
   */
  @Get('linkedin/callback')
  @ApiOperation({ summary: 'Handle LinkedIn OIDC authorization code callback' })
  async linkedinCallback(
    @Query('code') code: string,
    @Query('state') state?: string,
    @Query('redirectUri') redirectUri?: string,
  ) {
    return this.authService.handleLinkedInCallback(code, state, redirectUri);
  }

  /**
   * Phase 2: LinkedIn OIDC Token Exchange (POST for SPA / Popups)
   */
  @Post('linkedin/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange LinkedIn authorization code for Setu JWT session' })
  async linkedinToken(
    @Body() body: { code: string; redirectUri?: string; state?: string },
  ) {
    return this.authService.handleLinkedInCallback(body.code, body.state, body.redirectUri);
  }

  /**
   * Phase 2: High-Fidelity LinkedIn OIDC Sandbox Login (Development Testing)
   */
  @Post('linkedin/sandbox')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simulate LinkedIn OIDC verification in development test mode' })
  async linkedinSandbox(
    @Body()
    body?: {
      email?: string;
      displayName?: string;
      avatarUrl?: string;
      headline?: string;
      linkedinId?: string;
    },
  ) {
    return this.authService.linkedinSandboxLogin(body);
  }

  /**
   * Phase 2: Request 6-digit OTP code for corporate work email verification
   */
  @Post('request-work-email-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request 6-digit OTP code for corporate work email verification' })
  async requestWorkEmailOtp(
    @CurrentUser() user: any,
    @Body() body: { workEmail: string },
  ) {
    return this.authService.requestWorkEmailOtp(user.id, body.workEmail);
  }

  /**
   * Phase 2 / 3: Tier-2 Trust - Verify Corporate Work Email
   */
  @Post('verify-work-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tier-2 Trust: Verify corporate work email address' })
  async verifyWorkEmail(
    @CurrentUser() user: any,
    @Body() body: { workEmail: string; otp?: string },
  ) {
    return this.authService.verifyWorkEmail(user.id, body.workEmail, body.otp);
  }

  /**
   * Phase 2 / 3: Tier-4 Trust - Confirm Executive Role / Designation
   */
  @Post('confirm-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tier-4 Trust: Corporate Admin attestation confirming employee role' })
  async confirmRole(
    @CurrentUser() user: any,
    @Body() body: { targetProfileId: string; title: string; companyName?: string },
  ) {
    return this.authService.confirmRole(user.id, body.targetProfileId, body.title, body.companyName);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request 6-digit password reset code (10-minute validity)' })
  @ApiResponse({ status: 200, description: 'Reset code dispatched to email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 6-digit code and set new password' })
  @ApiResponse({ status: 200, description: 'Password reset successful; re-login required' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset code' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user identity and profile' })
  @ApiResponse({ status: 200, description: 'Current user retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }
}
