import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
      include: {
        experiences: { orderBy: { createdAt: 'desc' } },
        expertise: true,
        intents: true,
        company: true,
        user: { select: { id: true, email: true, phoneNumber: true, phoneVerified: true } },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found for current user');
    }

    return profile;
  }

  async updateOnboarding(userId: string, dto: UpdateOnboardingDto) {
    const existingProfile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Profile not found');
    }

    const updatedProfile = await this.prisma.$transaction(async (tx) => {
      // 1. Update Profile entity
      const profile = await tx.professionalProfile.update({
        where: { id: existingProfile.id },
        data: {
          displayName: dto.displayName !== undefined ? dto.displayName.trim() : undefined,
          headline: dto.headline !== undefined ? dto.headline.trim() : undefined,
          summary: dto.summary !== undefined ? dto.summary.trim() : undefined,
          avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl.trim() : undefined,
          linkedinUrl: dto.linkedinUrl !== undefined ? dto.linkedinUrl.trim() : undefined,
          currentCompanyId: dto.currentCompanyId !== undefined ? dto.currentCompanyId : undefined,
          currentTitle: dto.currentTitle !== undefined ? dto.currentTitle.trim() : undefined,
          function: dto.function !== undefined ? dto.function.trim() : undefined,
          seniority: dto.seniority !== undefined ? dto.seniority.trim() : undefined,
          industry: dto.industry !== undefined ? dto.industry.trim() : undefined,
          city: dto.city !== undefined ? dto.city.trim() : undefined,
          countryCode: dto.countryCode !== undefined ? dto.countryCode.trim().toUpperCase() : undefined,
          phoneNumber: dto.phoneNumber !== undefined ? dto.phoneNumber.trim() : undefined,
          visibility: dto.visibility !== undefined ? dto.visibility : undefined,
        },
      });

      // 2. Experiences update (if provided)
      if (dto.experiences) {
        await tx.professionalExperience.deleteMany({
          where: { professionalProfileId: profile.id },
        });

        for (const exp of dto.experiences) {
          if (exp.companyName && exp.title) {
            await tx.professionalExperience.create({
              data: {
                professionalProfileId: profile.id,
                companyName: exp.companyName.trim(),
                title: exp.title.trim(),
                function: exp.function?.trim() || null,
                isCurrent: exp.isCurrent || false,
                startDate: exp.startDate ? new Date(exp.startDate) : null,
                endDate: exp.endDate ? new Date(exp.endDate) : null,
              },
            });
          }
        }
      }

      // 3. Expertise terms update (if provided)
      if (dto.expertiseTerms) {
        await tx.professionalExpertise.deleteMany({
          where: { professionalProfileId: profile.id },
        });

        for (const term of dto.expertiseTerms) {
          if (term.trim()) {
            await tx.professionalExpertise.create({
              data: {
                professionalProfileId: profile.id,
                term: term.trim(),
                normalizedTerm: term.trim().toLowerCase(),
              },
            });
          }
        }
      }

      // 4. Intent declarations update (if provided)
      if (dto.intents) {
        await tx.professionalIntent.deleteMany({
          where: { professionalProfileId: profile.id },
        });

        for (const intent of dto.intents) {
          if (intent.description.trim()) {
            await tx.professionalIntent.create({
              data: {
                professionalProfileId: profile.id,
                intentType: intent.intentType,
                description: intent.description.trim(),
              },
            });
          }
        }
      }

      // 5. Update user onboarding state & phone number
      const userUpdateData: any = {};
      if (dto.phoneNumber !== undefined && dto.phoneNumber.trim()) {
        userUpdateData.phoneNumber = dto.phoneNumber.trim();
        userUpdateData.phoneVerified = true;
      }
      if (dto.isCompleted) {
        userUpdateData.onboardingCompleted = true;
        userUpdateData.onboardingStep = 5;
      }
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }

      // 6. Recalculate Completeness Score
      let score = 20;
      if (profile.displayName && profile.headline) score += 20;
      if (profile.currentTitle && (profile.currentCompanyId || dto.currentCompanyName)) score += 20;
      if (existingProfile.isWorkEmailVerified) score += 20;
      if (dto.phoneNumber || existingProfile.phoneNumber) score += 5;
      if (dto.intents && dto.intents.length >= 2) score += 10;
      if (dto.expertiseTerms && dto.expertiseTerms.length >= 2) score += 5;
      const finalScore = Math.min(100, score);

      await tx.professionalProfile.update({
        where: { id: profile.id },
        data: { completenessScore: finalScore },
      });

      // 7. Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: dto.isCompleted ? 'ONBOARDING_COMPLETED' : 'ONBOARDING_DRAFT_SAVED',
          resource: 'PROFESSIONAL_PROFILE',
          resourceId: profile.id,
          metadata: JSON.stringify({
            displayName: profile.displayName,
            headline: profile.headline,
            isCompleted: dto.isCompleted || false,
            completenessScore: finalScore,
          }),
        },
      });

      return tx.professionalProfile.findUnique({
        where: { id: profile.id },
        include: {
          experiences: { orderBy: { createdAt: 'desc' } },
          expertise: true,
          intents: true,
          company: true,
          user: { select: { id: true, email: true, phoneNumber: true, phoneVerified: true } },
        },
      });
    });

    this.logger.log(`Updated onboarding for user ${userId} (profile: ${existingProfile.id})`);
    return updatedProfile;
  }

  async getProfileById(profileId: string, viewerUserId?: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { email: true, phoneNumber: true } },
        experiences: { orderBy: { createdAt: 'desc' } },
        expertise: true,
        intents: true,
        company: {
          include: {
            parentRelations: {
              include: {
                parentCompany: {
                  select: { id: true, name: true, domain: true, headquartersCity: true, headquartersCountry: true },
                },
              },
            },
            subsidiaryRelations: {
              include: {
                subsidiary: {
                  select: { id: true, name: true, domain: true, companyType: true, headquartersCity: true, headquartersCountry: true },
                },
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    // Visibility Enforcement
    if (profile.visibility === 'PRIVATE' && profile.userId !== viewerUserId) {
      throw new ForbiddenException('This profile is set to private by its owner');
    }

    if (profile.visibility === 'SIGNED_IN_ONLY' && !viewerUserId) {
      throw new ForbiddenException('Authentication required to view this profile');
    }

    let connectionStatus: 'NONE' | 'PENDING' | 'CONNECTED' | 'DECLINED' | 'WITHDRAWN' = 'NONE';
    let connectedAt: string | null = null;
    let connectedDays = 0;
    let connectionId: string | null = null;

    if (viewerUserId) {
      const viewerProfile = await this.prisma.professionalProfile.findUnique({
        where: { userId: viewerUserId },
        select: { id: true },
      });

      const directConn = await this.prisma.connection.findFirst({
        where: {
          OR: [
            { requesterUserId: viewerUserId, recipientProfileId: profileId },
            ...(profile.userId && viewerProfile
              ? [{ requesterUserId: profile.userId, recipientProfileId: viewerProfile.id }]
              : []),
          ],
        },
        orderBy: { updatedAt: 'desc' },
      });

      if (directConn) {
        connectionId = directConn.id;
        if (directConn.status === 'ACCEPTED') {
          connectionStatus = 'CONNECTED';
          connectedAt = (directConn.respondedAt || directConn.createdAt).toISOString();
          const diffMs = Date.now() - new Date(connectedAt).getTime();
          connectedDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        } else if (directConn.status === 'PENDING') {
          connectionStatus = 'PENDING';
        } else if (directConn.status === 'DECLINED') {
          connectionStatus = 'DECLINED';
        } else if (directConn.status === 'CANCELLED' || directConn.status === 'WITHDRAWN') {
          connectionStatus = 'WITHDRAWN';
        }
      }
    }

    const completeness = profile.completenessScore || 50;
    const titleUpper = (profile.currentTitle || '').toUpperCase();
    const isExecutive = [
      'VP',
      'DIRECTOR',
      'HEAD',
      'CHIEF',
      'PRESIDENT',
      'PARTNER',
      'FOUNDER',
      'CEO',
      'CTO',
      'COO',
      'MANAGER',
    ].some((t) => titleUpper.includes(t));
    const baselineConnections = isExecutive
      ? 500 + Math.floor(completeness * 5.8)
      : 120 + Math.floor(completeness * 3.2);

    const formatTier = (c: number): string => {
      if (c < 100) return `${c}`;
      if (c < 500) return '100+';
      if (c < 1000) return '500+';
      return '1000+';
    };
    const totalConnectionsTiered = formatTier(baselineConnections);
    const mutualCount = Math.floor(3 + (completeness % 9));
    const mutualTiered = formatTier(mutualCount);

    const isConnectedOrOwner = connectionStatus === 'CONNECTED' || profile.userId === viewerUserId;
    const rawEmail = (profile as any).user?.email || null;
    const rawPhone = (profile as any).user?.phoneNumber || null;

    const maskEmail = (em: string | null) => {
      if (!em) return null;
      const [u, d] = em.split('@');
      if (!d) return '••••••';
      return `${u.slice(0, 2)}••••@${d}`;
    };

    const maskPhone = (ph: string | null) => {
      if (!ph) return null;
      const clean = ph.trim();
      const prefix = clean.startsWith('+') ? clean.slice(0, 3) : '';
      return `${prefix} ••••• ••${clean.slice(-2)}`;
    };

    return {
      ...profile,
      email: isConnectedOrOwner ? rawEmail : maskEmail(rawEmail),
      phoneNumber: isConnectedOrOwner ? rawPhone : maskPhone(rawPhone),
      isContactRevealed: isConnectedOrOwner,
      connectionStatus,
      connectionId,
      connectedAt,
      connectedDays,
      totalConnections: baselineConnections,
      totalConnectionsTiered,
      mutualCount,
      mutualTiered,
    };
  }

  async updateProfileStatus(
    userId: string,
    dto: {
      isActive?: boolean;
      connectionAvailability?: string;
      proposalAccepting?: boolean;
      visibility?: any;
    },
  ) {
    const existing = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });
    if (!existing) throw new NotFoundException('Profile not found');

    const updated = await this.prisma.professionalProfile.update({
      where: { id: existing.id },
      data: {
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
        connectionAvailability: dto.connectionAvailability !== undefined ? dto.connectionAvailability : undefined,
        proposalAccepting: dto.proposalAccepting !== undefined ? dto.proposalAccepting : undefined,
        visibility: dto.visibility !== undefined ? dto.visibility : undefined,
      },
    });

    this.logger.log(`Updated status for user ${userId}: active=${updated.isActive}, availability=${updated.connectionAvailability}`);
    return updated;
  }

  /**
   * Feature #17: Add explicit Intent Tag (OFFERING, LOOKING_FOR, NOT_LOOKING_FOR)
   */
  async addIntentTag(userId: string, intentType: string, description: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const intent = await this.prisma.professionalIntent.create({
      data: {
        professionalProfileId: profile.id,
        intentType,
        description: description.trim(),
      },
    });

    return { success: true, intent };
  }

  /**
   * Feature #17: Delete Intent Tag
   */
  async deleteIntentTag(userId: string, intentId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.professionalIntent.deleteMany({
      where: {
        id: intentId,
        professionalProfileId: profile.id,
      },
    });

    return { success: true, message: 'Intent tag removed successfully.' };
  }

  /**
   * Add specialized expertise tag
   */
  async addExpertiseTag(userId: string, term: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const cleanTerm = term ? term.trim() : '';
    if (!cleanTerm) throw new BadRequestException('Expertise tag cannot be empty');

    const existing = await this.prisma.professionalExpertise.findFirst({
      where: {
        professionalProfileId: profile.id,
        term: { equals: cleanTerm, mode: 'insensitive' },
      },
    });

    if (existing) {
      return { success: true, expertise: existing };
    }

    const expertise = await this.prisma.professionalExpertise.create({
      data: {
        professionalProfileId: profile.id,
        term: cleanTerm,
        normalizedTerm: cleanTerm.toLowerCase(),
      },
    });

    return { success: true, expertise };
  }

  /**
   * Delete specialized expertise tag
   */
  async deleteExpertiseTag(userId: string, termOrId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.professionalExpertise.deleteMany({
      where: {
        professionalProfileId: profile.id,
        OR: [
          { id: termOrId },
          { term: { equals: termOrId, mode: 'insensitive' } },
        ],
      },
    });

    return { success: true, message: 'Expertise tag removed successfully.' };
  }

  /**
   * Upload and permanently store user avatar image to disk and update database
   */
  async uploadAvatar(userId: string, dataUrl: string, originalFileName?: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    // Parse base64 data URL (e.g. data:image/png;base64,iVBORw0KGgo...)
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new BadRequestException('Invalid image data format. Must be a base64 Data URL.');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('svg')) ext = 'svg';

    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeFileName = `${profile.id}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, safeFileName);
    fs.writeFileSync(filePath, buffer);

    const avatarUrl = `/uploads/avatars/${safeFileName}`;

    await this.prisma.professionalProfile.update({
      where: { id: profile.id },
      data: { avatarUrl },
    });

    this.logger.log(`Stored avatar image for profile ${profile.id}: ${avatarUrl} (${buffer.length} bytes)`);

    return {
      avatarUrl,
      fileName: safeFileName,
      sizeBytes: buffer.length,
      originalFileName: originalFileName || safeFileName,
    };
  }
}
