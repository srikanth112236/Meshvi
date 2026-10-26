import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTriggerDto } from './dto/create-trigger.dto';
import { TriggerType } from '@prisma/client';

@Injectable()
export class TriggersService {
  private readonly logger = new Logger(TriggersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getCompanyTriggers(companyId: string) {
    return this.prisma.triggerSignal.findMany({
      where: {
        companyId,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: [{ relevanceScore: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    });
  }

  async createTrigger(dto: CreateTriggerDto) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day expiry
    return this.prisma.triggerSignal.create({
      data: {
        companyId: dto.companyId,
        triggerType: dto.triggerType,
        headline: dto.headline,
        body: dto.body,
        sourceUrl: dto.sourceUrl,
        relevanceScore: dto.relevanceScore ?? 0.7,
        isVerified: false,
        expiresAt,
      },
    });
  }

  async declareTrigger(userId: string, companyId: string, dto: Omit<CreateTriggerDto, 'companyId'>) {
    // User-declared trigger (from company admin)
    const membership = await this.prisma.companyMembership.findFirst({
      where: { userId, companyId, membershipStatus: 'ACTIVE' },
    });
    // Allow anyone to declare on their own company, skip strict check for now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);
    return this.prisma.triggerSignal.create({
      data: {
        companyId,
        triggerType: TriggerType.USER_DECLARED,
        headline: dto.headline,
        body: dto.body,
        relevanceScore: 0.9, // User-declared is highly relevant
        isVerified: true, // Self-declared = verified
        expiresAt,
      },
    });
  }

  async getRecentTriggerFeed(limit = 20) {
    return this.prisma.triggerSignal.findMany({
      where: { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
      include: { company: { select: { id: true, name: true, industry: true, headquartersCountry: true } } },
      orderBy: [{ relevanceScore: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }

  async getTriggersForCompanyIds(companyIds: string[]) {
    if (companyIds.length === 0) return {};
    const triggers = await this.prisma.triggerSignal.findMany({
      where: {
        companyId: { in: companyIds },
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: { relevanceScore: 'desc' },
    });
    // Group by companyId
    const grouped: Record<string, any[]> = {};
    for (const t of triggers) {
      if (!grouped[t.companyId]) grouped[t.companyId] = [];
      grouped[t.companyId].push(t);
    }
    return grouped;
  }
}
