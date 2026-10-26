import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertReadinessDto } from './dto/upsert-readiness.dto';
import { ReadinessStatus } from '@prisma/client';

@Injectable()
export class ReadinessService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyReadiness(userId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
      include: { readiness: true },
    });
    if (!profile) throw new NotFoundException('Professional profile not found');
    return profile.readiness || null;
  }

  async upsertMyReadiness(userId: string, dto: UpsertReadinessDto) {
    const profile = await this.prisma.professionalProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Professional profile not found');

    const data: any = {
      status: dto.status ?? ReadinessStatus.OPEN,
      activeSectors: dto.activeSectors ?? null,
      activeGeographies: dto.activeGeographies ?? null,
      partnershipTypes: dto.partnershipTypes ?? null,
      notLookingFor: dto.notLookingFor ?? null,
      openMessage: dto.openMessage ?? null,
      refreshedAt: new Date(),
    };

    return this.prisma.partnershipReadiness.upsert({
      where: { profileId: profile.id },
      update: data,
      create: { ...data, profileId: profile.id },
    });
  }

  async getProfileReadiness(profileId: string) {
    return this.prisma.partnershipReadiness.findUnique({ where: { profileId } });
  }

  async getCompanyReadiness(companyId: string) {
    return this.prisma.partnershipReadiness.findUnique({ where: { companyId } });
  }

  async upsertCompanyReadiness(userId: string, companyId: string, dto: UpsertReadinessDto) {
    const membership = await this.prisma.companyMembership.findFirst({
      where: { userId, companyId, membershipStatus: 'ACTIVE' },
    });
    if (!membership) throw new NotFoundException('Company membership not found');

    const data: any = {
      status: dto.status ?? ReadinessStatus.OPEN,
      activeSectors: dto.activeSectors ?? null,
      activeGeographies: dto.activeGeographies ?? null,
      partnershipTypes: dto.partnershipTypes ?? null,
      notLookingFor: dto.notLookingFor ?? null,
      openMessage: dto.openMessage ?? null,
      refreshedAt: new Date(),
    };

    return this.prisma.partnershipReadiness.upsert({
      where: { companyId },
      update: data,
      create: { ...data, companyId },
    });
  }

  async markResponded(profileId: string) {
    const existing = await this.prisma.partnershipReadiness.findUnique({ where: { profileId } });
    if (!existing) return;
    return this.prisma.partnershipReadiness.update({
      where: { profileId },
      data: { lastRespondedAt: new Date() },
    });
  }
}
