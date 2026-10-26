import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { ExpressInterestDto } from './dto/express-interest.dto';
import {
  OpportunityOwnerType,
  OpportunityStatus,
  OpportunityVisibility,
  OpportunityMatchLevel,
  OpportunityRequestStatus,
} from '@prisma/client';

@Injectable()
export class OpportunitiesService {
  private readonly logger = new Logger(OpportunitiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: verify user has permission to manage company or profile
   */
  private async verifyOwnership(userId: string, ownerType: OpportunityOwnerType, companyId?: string, profileId?: string) {
    if (ownerType === OpportunityOwnerType.COMPANY) {
      let resolvedCompanyId = companyId;
      if (!resolvedCompanyId) {
        const membership = await this.prisma.companyMembership.findFirst({
          where: { userId, membershipStatus: 'ACTIVE' },
        });
        if (membership) {
          resolvedCompanyId = membership.companyId;
        } else {
          const prof = await this.prisma.professionalProfile.findUnique({ where: { userId } });
          if (prof?.currentCompanyId) resolvedCompanyId = prof.currentCompanyId;
        }
      }
      if (!resolvedCompanyId) throw new BadRequestException('companyId is required for COMPANY ownerType');
      const membership = await this.prisma.companyMembership.findFirst({
        where: {
          userId,
          companyId: resolvedCompanyId,
          membershipStatus: 'ACTIVE',
        },
      });
      if (!membership) {
        const prof = await this.prisma.professionalProfile.findUnique({ where: { userId } });
        if (prof?.currentCompanyId !== resolvedCompanyId) {
          throw new ForbiddenException('You are not an authorized member of this company');
        }
      }
      return { companyId: resolvedCompanyId };
    } else {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId },
      });
      if (!profile) {
        throw new NotFoundException('You must have a professional profile before creating an opportunity');
      }
      return { profileId: profile.id };
    }
  }

  /**
   * 1. Create a draft or active opportunity
   */
  async createOpportunity(userId: string, dto: CreateOpportunityDto) {
    const verified = await this.verifyOwnership(userId, dto.ownerType, dto.companyId);

    const opportunity = await this.prisma.opportunityProfile.create({
      data: {
        ownerType: dto.ownerType,
        companyId: verified.companyId || null,
        profileId: verified.profileId || null,
        createdById: userId,
        title: dto.title,
        summary: dto.summary || null,
        status: dto.status || OpportunityStatus.DRAFT,
        visibility: dto.visibility || OpportunityVisibility.DISCOVERABLE,
        approvalMode: dto.approvalMode || 'MANUAL',
        targetIndustries: dto.targetIndustries ? JSON.stringify(dto.targetIndustries) : null,
        targetMarkets: dto.targetMarkets ? JSON.stringify(dto.targetMarkets) : null,
        partnerTypes: dto.partnerTypes ? JSON.stringify(dto.partnerTypes) : null,
        publishedAt: dto.status === OpportunityStatus.ACTIVE ? new Date() : null,
        requirements: dto.seeking
          ? {
              create: {
                businessObjective: dto.seeking.objectives?.[0] || 'commercial_partnership',
                partnerType: dto.seeking.partnerTypes?.[0] || null,
                industries: dto.seeking.industries ? JSON.stringify(dto.seeking.industries) : null,
                geographies: dto.seeking.geographies ? JSON.stringify(dto.seeking.geographies) : null,
                description: dto.seeking.description || null,
              },
            }
          : undefined,
        offers: dto.offering
          ? {
              create: {
                capability: dto.offering.capabilities?.[0] || 'market_representation',
                productsServices: dto.offering.productsServices || null,
                marketAccess: dto.offering.marketAccess || null,
                geographies: dto.offering.geographies ? JSON.stringify(dto.offering.geographies) : null,
              },
            }
          : undefined,
      },
      include: {
        requirements: true,
        offers: true,
        company: true,
        profile: true,
      },
    });

    await this.prisma.opportunityEvent.create({
      data: {
        opportunityProfileId: opportunity.id,
        userId,
        eventType: 'CREATED',
        detailsJson: JSON.stringify({ title: opportunity.title, status: opportunity.status }),
      },
    });

    if (opportunity.status === OpportunityStatus.ACTIVE) {
      await this.runMutualMatching(opportunity.id);
    }

    return opportunity;
  }

  /**
   * 2. List all opportunities owned by current user (personal or via active company memberships)
   */
  async getMyOpportunities(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        memberships: { where: { membershipStatus: 'ACTIVE' } },
      },
    });

    const companyIds = user?.memberships.map((m) => m.companyId) || [];
    const profileId = user?.profile?.id;

    return this.prisma.opportunityProfile.findMany({
      where: {
        OR: [
          { createdById: userId },
          ...(profileId ? [{ profileId }] : []),
          ...(companyIds.length > 0 ? [{ companyId: { in: companyIds } }] : []),
        ],
      },
      include: {
        requirements: true,
        offers: true,
        company: true,
        profile: true,
        _count: {
          select: {
            sourceMatches: true,
            targetMatches: true,
            receivedRequests: true,
            sentRequests: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * 3. Get single opportunity
   */
  async getOpportunity(userId: string, id: string) {
    const opp = await this.prisma.opportunityProfile.findUnique({
      where: { id },
      include: {
        requirements: true,
        offers: true,
        company: true,
        profile: true,
        events: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!opp) throw new NotFoundException('Opportunity not found');

    if (opp.visibility === OpportunityVisibility.PRIVATE && opp.createdById !== userId) {
      // Check company membership
      if (opp.companyId) {
        const mem = await this.prisma.companyMembership.findFirst({
          where: { userId, companyId: opp.companyId, membershipStatus: 'ACTIVE' },
        });
        if (!mem) throw new ForbiddenException('This opportunity is private');
      } else {
        throw new ForbiddenException('This opportunity is private');
      }
    }

    return opp;
  }

  /**
   * 4. Update an owned opportunity
   */
  async updateOpportunity(userId: string, id: string, dto: UpdateOpportunityDto) {
    const opp = await this.prisma.opportunityProfile.findUnique({ where: { id } });
    if (!opp) throw new NotFoundException('Opportunity not found');
    if (opp.createdById !== userId) {
      if (opp.companyId) {
        const mem = await this.prisma.companyMembership.findFirst({
          where: { userId, companyId: opp.companyId, membershipStatus: 'ACTIVE' },
        });
        if (!mem) throw new ForbiddenException('Not authorized to edit this opportunity');
      } else {
        throw new ForbiddenException('Not authorized to edit this opportunity');
      }
    }

    const updated = await this.prisma.opportunityProfile.update({
      where: { id },
      data: {
        title: dto.title ?? opp.title,
        summary: dto.summary !== undefined ? dto.summary : opp.summary,
        status: dto.status ?? opp.status,
        visibility: dto.visibility ?? opp.visibility,
        approvalMode: dto.approvalMode ?? opp.approvalMode,
        targetIndustries: dto.targetIndustries ? JSON.stringify(dto.targetIndustries) : opp.targetIndustries,
        targetMarkets: dto.targetMarkets ? JSON.stringify(dto.targetMarkets) : opp.targetMarkets,
        partnerTypes: dto.partnerTypes ? JSON.stringify(dto.partnerTypes) : opp.partnerTypes,
      },
      include: {
        requirements: true,
        offers: true,
        company: true,
        profile: true,
      },
    });

    await this.prisma.opportunityEvent.create({
      data: {
        opportunityProfileId: id,
        userId,
        eventType: 'UPDATED',
        detailsJson: JSON.stringify({ title: updated.title, status: updated.status }),
      },
    });

    if (updated.status === OpportunityStatus.ACTIVE) {
      await this.runMutualMatching(id);
    }

    return updated;
  }

  /**
   * 5. Publish opportunity
   */
  async publishOpportunity(userId: string, id: string) {
    const opp = await this.prisma.opportunityProfile.findUnique({
      where: { id },
      include: { requirements: true, offers: true },
    });
    if (!opp) throw new NotFoundException('Opportunity not found');
    if (opp.createdById !== userId) throw new ForbiddenException('Not authorized');

    const updated = await this.prisma.opportunityProfile.update({
      where: { id },
      data: {
        status: OpportunityStatus.ACTIVE,
        publishedAt: new Date(),
        pausedAt: null,
      },
      include: { requirements: true, offers: true, company: true, profile: true },
    });

    await this.prisma.opportunityEvent.create({
      data: {
        opportunityProfileId: id,
        userId,
        eventType: 'PUBLISHED',
      },
    });

    await this.runMutualMatching(id);
    return updated;
  }

  /**
   * 6. Pause opportunity
   */
  async pauseOpportunity(userId: string, id: string) {
    const opp = await this.prisma.opportunityProfile.findUnique({ where: { id } });
    if (!opp) throw new NotFoundException('Opportunity not found');
    if (opp.createdById !== userId) throw new ForbiddenException('Not authorized');

    const updated = await this.prisma.opportunityProfile.update({
      where: { id },
      data: {
        status: OpportunityStatus.PAUSED,
        pausedAt: new Date(),
      },
    });

    await this.prisma.opportunityEvent.create({
      data: {
        opportunityProfileId: id,
        userId,
        eventType: 'PAUSED',
      },
    });

    return updated;
  }

  /**
   * 7. Archive opportunity
   */
  async archiveOpportunity(userId: string, id: string) {
    const opp = await this.prisma.opportunityProfile.findUnique({ where: { id } });
    if (!opp) throw new NotFoundException('Opportunity not found');
    if (opp.createdById !== userId) throw new ForbiddenException('Not authorized');

    const updated = await this.prisma.opportunityProfile.update({
      where: { id },
      data: {
        status: OpportunityStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });

    await this.prisma.opportunityEvent.create({
      data: {
        opportunityProfileId: id,
        userId,
        eventType: 'ARCHIVED',
      },
    });

    return updated;
  }

  /**
   * 8. Mutual Matching Engine
   * Evaluates requirements against offers symmetrically
   */
  async runMutualMatching(opportunityId: string) {
    const source = await this.prisma.opportunityProfile.findUnique({
      where: { id: opportunityId },
      include: { requirements: true, offers: true, company: true, profile: true },
    });
    if (!source || source.status !== OpportunityStatus.ACTIVE) return [];

    // Find candidate active opportunities
    const candidates = await this.prisma.opportunityProfile.findMany({
      where: {
        id: { not: source.id },
        status: OpportunityStatus.ACTIVE,
        visibility: OpportunityVisibility.DISCOVERABLE,
        ...(source.companyId ? { companyId: { not: source.companyId } } : {}),
      },
      include: { requirements: true, offers: true, company: true, profile: true },
      take: 50,
    });

    const parsedSourceMarkets: string[] = source.targetMarkets ? JSON.parse(source.targetMarkets) : [];
    const parsedSourceIndustries: string[] = source.targetIndustries ? JSON.parse(source.targetIndustries) : [];
    const sourceOffers = source.offers.map((o) => o.capability.toLowerCase());
    const sourceRequires = source.requirements.map((r) => r.businessObjective.toLowerCase());

    for (const cand of candidates) {
      let score = 0;
      const overlaps: string[] = [];
      const candMarkets: string[] = cand.targetMarkets ? JSON.parse(cand.targetMarkets) : [];
      const candIndustries: string[] = cand.targetIndustries ? JSON.parse(cand.targetIndustries) : [];
      const candOffers = cand.offers.map((o) => o.capability.toLowerCase());
      const candRequires = cand.requirements.map((r) => r.businessObjective.toLowerCase());

      // 1. Direct Objective-to-Offer Alignment (Weight: 35)
      // Check if candidate offers what source seeks OR source offers what candidate seeks
      const sourceSeekMatch = sourceRequires.some((sr) =>
        candOffers.some((co) => co.includes(sr) || sr.includes(co) || co.includes('distribution') && sr.includes('distribution')),
      );
      const candSeekMatch = candRequires.some((cr) =>
        sourceOffers.some((so) => so.includes(cr) || cr.includes(so) || so.includes('distribution') && cr.includes('distribution')),
      );

      let isTwoWayMatch = false;
      if (sourceSeekMatch && candSeekMatch) {
        score += 35;
        isTwoWayMatch = true;
        overlaps.push('Symmetrical Two-Way Business Alignment: Mutual Offer & Demand match');
      } else if (sourceSeekMatch || candSeekMatch) {
        score += 22;
        overlaps.push('One-Way Direct Strategic Alignment');
      }

      // 2. Industry Compatibility (Weight: 20)
      const commonIndustries = parsedSourceIndustries.filter((si) =>
        candIndustries.some((ci) => ci.toLowerCase() === si.toLowerCase() || ci.toLowerCase().includes(si.toLowerCase())),
      );
      if (commonIndustries.length > 0) {
        score += 20;
        overlaps.push(`Shared Industry Sector: ${commonIndustries.join(', ')}`);
      } else if (source.company?.industry && cand.company?.industry && source.company.industry === cand.company.industry) {
        score += 15;
        overlaps.push(`Aligned Market Vertical: ${source.company.industry}`);
      }

      // 3. Geographic / Target Market Fit (Weight: 20)
      const commonMarkets = parsedSourceMarkets.filter((sm) =>
        candMarkets.some((cm) => cm.toUpperCase() === sm.toUpperCase()),
      );
      if (commonMarkets.length > 0) {
        score += 20;
        overlaps.push(`Co-located Target Geography: ${commonMarkets.join(', ')}`);
      } else if (source.company?.headquartersCountry && cand.company?.headquartersCountry && source.company.headquartersCountry === cand.company.headquartersCountry) {
        score += 15;
        overlaps.push(`Shared Operating Country: ${source.company.headquartersCountry}`);
      }

      // 4. Partner or Company Type (Weight: 15)
      if (source.partnerTypes && cand.partnerTypes) {
        score += 15;
        overlaps.push('Compatible Commercial Partner Profile');
      } else {
        score += 10;
      }

      // 5. Supporting Capabilities (Weight: 10)
      if (cand.offers.length > 0 && source.offers.length > 0) {
        score += 10;
        overlaps.push('Verified Corporate Capabilities Active');
      }

      // Classify match level:
      // MUTUAL_INTENT: Symmetrical two-way match AND score >= 65
      // POTENTIAL_FIT: Score >= 40
      // NOT_ELIGIBLE: Score < 40
      let matchLevel: OpportunityMatchLevel = OpportunityMatchLevel.POTENTIAL_FIT;
      if (isTwoWayMatch && score >= 65) {
        matchLevel = OpportunityMatchLevel.MUTUAL_INTENT;
      } else if (score < 40) {
        matchLevel = OpportunityMatchLevel.NOT_ELIGIBLE;
      }

      if (matchLevel !== OpportunityMatchLevel.NOT_ELIGIBLE) {
        const evidenceJson = JSON.stringify({
          sourceWants: source.requirements[0]?.description || sourceRequires.join(', '),
          candOffers: cand.offers[0]?.productsServices || candOffers.join(', '),
          candWants: cand.requirements[0]?.description || candRequires.join(', '),
          sourceOffers: source.offers[0]?.productsServices || sourceOffers.join(', '),
          commonMarkets,
          overlaps,
          score,
        });

        const whyMatches =
          matchLevel === OpportunityMatchLevel.MUTUAL_INTENT
            ? `Direct Mutual Intent: Both profiles have complementary offers and active acquisition criteria across ${commonMarkets.length > 0 ? commonMarkets.join('/') : 'regional corridors'}.`
            : `Potential Opportunity Fit: Aligned commercial scope in ${cand.company?.industry || 'industry'} with overlapping target territories.`;

        await this.prisma.opportunityMatch.upsert({
          where: {
            sourceOpportunityId_targetOpportunityId: {
              sourceOpportunityId: source.id,
              targetOpportunityId: cand.id,
            },
          },
          update: {
            score,
            matchLevel,
            evidenceJson,
            whyMatches,
            lastEvaluatedAt: new Date(),
          },
          create: {
            sourceOpportunityId: source.id,
            targetOpportunityId: cand.id,
            score,
            matchLevel,
            evidenceJson,
            whyMatches,
          },
        });
      }
    }
  }

  /**
   * 9. Get all matches for user's active opportunities
   */
  async getMatches(userId: string, filter?: { opportunityId?: string; level?: string }) {
    const myOpps = await this.getMyOpportunities(userId);
    const oppIds = myOpps.map((o) => o.id);
    if (oppIds.length === 0) return [];

    const targetOppIds = filter?.opportunityId ? [filter.opportunityId] : oppIds;

    const matches = await this.prisma.opportunityMatch.findMany({
      where: {
        OR: [
          { sourceOpportunityId: { in: targetOppIds } },
          { targetOpportunityId: { in: targetOppIds } },
        ],
        status: 'ACTIVE',
        targetOpportunity: { status: OpportunityStatus.ACTIVE },
        sourceOpportunity: { status: OpportunityStatus.ACTIVE },
        ...(filter?.level ? { matchLevel: filter.level as OpportunityMatchLevel } : {}),
      },
      include: {
        sourceOpportunity: {
          include: {
            company: { include: { triggerSignals: { take: 2, orderBy: { createdAt: 'desc' } } } },
            profile: true,
            requirements: true,
            offers: true,
          },
        },
        targetOpportunity: {
          include: {
            company: { include: { triggerSignals: { take: 2, orderBy: { createdAt: 'desc' } } } },
            profile: true,
            requirements: true,
            offers: true,
          },
        },
      },
      orderBy: [{ score: 'desc' }, { lastEvaluatedAt: 'desc' }],
      take: 40,
    });

    return matches.map((m) => {
      let evidence: any = {};
      try {
        evidence = JSON.parse(m.evidenceJson);
      } catch {
        evidence = {};
      }

      // If user's opportunity is targetOpportunityId, swap so that user's own opportunity
      // is always sourceOpportunity and the counterparty is targetOpportunity.
      const isUserTarget = targetOppIds.includes(m.targetOpportunityId);
      if (isUserTarget) {
        return {
          ...m,
          sourceOpportunityId: m.targetOpportunityId,
          targetOpportunityId: m.sourceOpportunityId,
          sourceOpportunity: m.targetOpportunity,
          targetOpportunity: m.sourceOpportunity,
          evidence: {
            ...evidence,
            sourceWants: evidence.candWants || evidence.sourceWants,
            candOffers: evidence.sourceOffers || evidence.candOffers,
            candWants: evidence.sourceWants || evidence.candWants,
            sourceOffers: evidence.candOffers || evidence.sourceOffers,
          },
        };
      }

      return {
        ...m,
        evidence,
      };
    });
  }

  /**
   * 9b. Discover public active opportunities across the network
   */
  async discoverOpportunities(userId: string, filter?: { search?: string; industry?: string }) {
    const myOpps = await this.getMyOpportunities(userId);
    const myOppIds = myOpps.map((o) => o.id);

    const where: any = {
      status: OpportunityStatus.ACTIVE,
      visibility: OpportunityVisibility.DISCOVERABLE,
      id: { notIn: myOppIds },
      createdById: { not: userId },
    };

    if (filter?.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { summary: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.opportunityProfile.findMany({
      where,
      include: {
        company: { include: { triggerSignals: { take: 2, orderBy: { createdAt: 'desc' } } } },
        profile: true,
        requirements: true,
        offers: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
  }

  /**
   * 9c. Get active opportunities for a specific company
   */
  async getCompanyOpportunities(companyId: string) {
    return this.prisma.opportunityProfile.findMany({
      where: {
        companyId,
        status: OpportunityStatus.ACTIVE,
        visibility: OpportunityVisibility.DISCOVERABLE,
      },
      include: {
        requirements: true,
        offers: true,
        company: true,
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  /**
   * 10. Express interest in an opportunity (Send Request)
   */
  async expressInterest(userId: string, dto: ExpressInterestDto) {
    if (dto.senderOpportunityId === dto.recipientOpportunityId) {
      throw new BadRequestException('You cannot express interest in your own opportunity profile');
    }

    // Verify sender ownership with intelligent fallback if stale senderOpportunityId was passed
    let senderOpp = await this.prisma.opportunityProfile.findUnique({
      where: { id: dto.senderOpportunityId },
      include: { company: true, profile: true },
    });

    if (!senderOpp) {
      const myOpps = await this.getMyOpportunities(userId);
      if (myOpps.length > 0) {
        senderOpp = myOpps[0] as any;
        dto.senderOpportunityId = myOpps[0].id;
      }
    }

    if (!senderOpp) throw new NotFoundException('Your sender opportunity was not found');
    if (senderOpp.createdById !== userId) {
      if (senderOpp.companyId) {
        const mem = await this.prisma.companyMembership.findFirst({
          where: { userId, companyId: senderOpp.companyId, membershipStatus: 'ACTIVE' },
        });
        if (!mem) throw new ForbiddenException('Not authorized to express interest on behalf of this opportunity');
      } else {
        throw new ForbiddenException('Not authorized');
      }
    }

    // Prevent duplicate request
    const existing = await this.prisma.opportunityRequest.findFirst({
      where: {
        senderOpportunityId: dto.senderOpportunityId,
        recipientOpportunityId: dto.recipientOpportunityId,
        status: { in: [OpportunityRequestStatus.PENDING, OpportunityRequestStatus.ACCEPTED, OpportunityRequestStatus.CLARIFICATION_REQUESTED] },
      },
    });
    if (existing) {
      throw new ConflictException('An active commercial interest request already exists for this opportunity');
    }

    // Get recipient opportunity
    const recipientOpp = await this.prisma.opportunityProfile.findUnique({
      where: { id: dto.recipientOpportunityId },
      include: { company: true, profile: true },
    });
    if (!recipientOpp) throw new NotFoundException('Target opportunity not found');
    if (recipientOpp.status !== OpportunityStatus.ACTIVE) {
      throw new BadRequestException('Target opportunity is not currently active');
    }

    const recipientUserId = recipientOpp.createdById;

    // Strict quota check: 30 active requests max
    const activeCount = await this.prisma.opportunityRequest.count({
      where: { senderUserId: userId, status: OpportunityRequestStatus.PENDING },
    });
    if (activeCount >= 30) {
      throw new BadRequestException('Opportunity request quota reached (30 active pending requests)');
    }

    const request = await this.prisma.opportunityRequest.create({
      data: {
        opportunityMatchId: dto.opportunityMatchId || null,
        senderOpportunityId: dto.senderOpportunityId,
        recipientOpportunityId: dto.recipientOpportunityId,
        senderUserId: userId,
        recipientUserId,
        message: dto.message,
        status: OpportunityRequestStatus.PENDING,
      },
      include: {
        senderOpportunity: { include: { company: true, profile: true } },
        recipientOpportunity: { include: { company: true, profile: true } },
      },
    });

    await this.prisma.opportunityEvent.create({
      data: {
        opportunityProfileId: dto.senderOpportunityId,
        userId,
        eventType: 'REQUEST_SENT',
        detailsJson: JSON.stringify({ requestId: request.id, targetTitle: recipientOpp.title }),
      },
    });

    // In-app notification
    await this.prisma.notification.create({
      data: {
        userId: recipientUserId,
        type: 'CONNECTION_REQUEST',
        title: '💼 New Business Opportunity Request',
        body: `${senderOpp.company?.name || senderOpp.profile?.displayName || 'An enterprise partner'} expressed interest in "${recipientOpp.title}".`,
        actionUrl: `/app/opportunities?tab=received`,
        actorId: userId,
      },
    });

    return request;
  }

  /**
   * 11. List sent and received requests
   */
  async getRequests(userId: string, type: 'received' | 'sent' | 'all' = 'all') {
    const where: any = {};
    if (type === 'received') {
      where.recipientUserId = userId;
    } else if (type === 'sent') {
      where.senderUserId = userId;
    } else {
      where.OR = [{ recipientUserId: userId }, { senderUserId: userId }];
    }

    return this.prisma.opportunityRequest.findMany({
      where,
      include: {
        senderOpportunity: { include: { company: true, profile: true, offers: true, requirements: true } },
        recipientOpportunity: { include: { company: true, profile: true, offers: true, requirements: true } },
        senderUser: { include: { profile: true } },
        recipientUser: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 12. Accept Request (Generates Connection & Deal Room!)
   */
  async acceptRequest(userId: string, requestId: string) {
    const request = await this.prisma.opportunityRequest.findUnique({
      where: { id: requestId },
      include: {
        senderOpportunity: { include: { company: true, profile: true } },
        recipientOpportunity: { include: { company: true, profile: true } },
      },
    });
    if (!request) throw new NotFoundException('Opportunity request not found');
    if (request.recipientUserId !== userId) {
      throw new ForbiddenException('Only the recipient can accept this business request');
    }

    // 1. Establish or update Connection record between sender and recipient
    const recipientProfile = await this.prisma.professionalProfile.findUnique({ where: { userId } });
    let connectionId: string | null = null;
    if (recipientProfile) {
      const conn = await this.prisma.connection.upsert({
        where: {
          requesterUserId_recipientProfileId: {
            requesterUserId: request.senderUserId,
            recipientProfileId: recipientProfile.id,
          },
        },
        update: { status: 'ACCEPTED', respondedAt: new Date() },
        create: {
          requesterUserId: request.senderUserId,
          recipientProfileId: recipientProfile.id,
          businessReason: `Mutual Opportunity Accepted: ${request.recipientOpportunity.title}`,
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });
      connectionId = conn.id;
    }

    // 2. Spawn Deal Room for bilateral coordination
    let dealRoomId: string | null = null;
    if (connectionId) {
      const room = await this.prisma.dealRoom.upsert({
        where: { connectionId },
        update: {
          status: 'ACTIVE',
        },
        create: {
          connectionId,
          initiatorUserId: request.senderUserId,
          partnerUserId: userId,
          title: `Opportunity: ${request.recipientOpportunity.title.slice(0, 80)}`,
          initiatorGoal: request.senderOpportunity.summary || 'Establish bilateral commercial distribution',
          partnerGoal: request.recipientOpportunity.summary || 'Scale regional market concessions',
          status: 'ACTIVE',
        },
      });
      dealRoomId = room.id;
    }

    const updated = await this.prisma.opportunityRequest.update({
      where: { id: requestId },
      data: {
        status: OpportunityRequestStatus.ACCEPTED,
        connectionId,
        dealRoomId,
        respondedAt: new Date(),
      },
    });

    await this.prisma.opportunityEvent.create({
      data: {
        opportunityProfileId: request.recipientOpportunityId,
        userId,
        eventType: 'REQUEST_ACCEPTED',
        detailsJson: JSON.stringify({ requestId, connectionId, dealRoomId }),
      },
    });

    // Notify sender of acceptance
    await this.prisma.notification.create({
      data: {
        userId: request.senderUserId,
        type: 'CONNECTION_ACCEPTED',
        title: '🎉 Opportunity Proposal Accepted!',
        body: `Your request for "${request.recipientOpportunity.title}" was accepted. A dedicated Deal Room is now open!`,
        actionUrl: dealRoomId ? `/app/deal-rooms/${dealRoomId}` : `/app/opportunities?tab=connected`,
        actorId: userId,
      },
    });

    return updated;
  }

  /**
   * 13. Decline Request
   */
  async declineRequest(userId: string, requestId: string, reason?: string) {
    const request = await this.prisma.opportunityRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Opportunity request not found');
    if (request.recipientUserId !== userId) {
      throw new ForbiddenException('Only the recipient can decline this request');
    }

    return this.prisma.opportunityRequest.update({
      where: { id: requestId },
      data: {
        status: OpportunityRequestStatus.DECLINED,
        decisionReason: reason || null,
        respondedAt: new Date(),
      },
    });
  }

  /**
   * 14. Request Clarification or Answer Clarification
   */
  async clarifyRequest(userId: string, requestId: string, question?: string, answer?: string) {
    const request = await this.prisma.opportunityRequest.findUnique({
      where: { id: requestId },
      include: { recipientOpportunity: true },
    });
    if (!request) throw new NotFoundException('Opportunity request not found');

    if (question && request.recipientUserId === userId) {
      // Recipient asking for more information
      const updated = await this.prisma.opportunityRequest.update({
        where: { id: requestId },
        data: {
          status: OpportunityRequestStatus.CLARIFICATION_REQUESTED,
          clarificationQuestion: question,
        },
      });

      await this.prisma.notification.create({
        data: {
          userId: request.senderUserId,
          type: 'SYSTEM_ALERT',
          title: '💬 More Information Requested',
          body: `Recipient requested clarification on your proposal for "${request.recipientOpportunity.title}": "${question}"`,
          actionUrl: `/app/opportunities?tab=sent`,
          actorId: userId,
        },
      });

      return updated;
    } else if (answer && request.senderUserId === userId) {
      // Sender answering clarification question
      const updated = await this.prisma.opportunityRequest.update({
        where: { id: requestId },
        data: {
          status: OpportunityRequestStatus.PENDING,
          clarificationAnswer: answer,
        },
      });

      await this.prisma.notification.create({
        data: {
          userId: request.recipientUserId,
          type: 'SYSTEM_ALERT',
          title: '💬 Clarification Provided',
          body: `Sender replied to your question regarding "${request.recipientOpportunity.title}".`,
          actionUrl: `/app/opportunities?tab=received`,
          actorId: userId,
        },
      });

      return updated;
    } else {
      throw new ForbiddenException('Not authorized to clarify this request');
    }
  }
}
