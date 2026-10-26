import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { ConnectionResponseAction } from './dto/respond-connection.dto';
import { CreateIntroductionDto } from './dto/create-introduction.dto';
import { IntroductionAction } from './dto/respond-introduction.dto';
import { SmartDraftDto, LintNoteDto } from './dto/wave3-connection.dto';
import { ConnectionStatus, IntroductionStatus, NotificationType } from '@prisma/client';

export interface ConnectionMeta {
  reminderCount?: number;
  remindedAt?: string;
  reminderNote?: string;
  clarificationQuestion?: string;
  clarificationAskedAt?: string;
  clarificationAnswer?: string;
  clarificationAnsweredAt?: string;
  withdrawnAt?: string;
  quotaRestored?: boolean;
}

export function parseConnectionMeta(raw?: string | null): ConnectionMeta {
  if (!raw) return {};
  try {
    if (raw.startsWith('{') && raw.endsWith('}')) {
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

@Injectable()
export class ConnectionsService {
  private readonly logger = new Logger(ConnectionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Anti-Spam Quota Engine: Calculates 7-day rolling connection request quota
   */
  async getConnectionQuota(userId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        memberships: {
          where: { membershipStatus: 'ACTIVE' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isVerified = Boolean(
      user.workEmailVerified ||
        user.profile?.isWorkEmailVerified ||
        user.linkedinVerified ||
        user.profile?.isLinkedInVerified,
    );

    let limit = isVerified ? 100 : 50;

    if (user.memberships && user.memberships.length > 0) {
      const highestMemberLimit = Math.max(...user.memberships.map((m) => m.maxOpenBridges || 15));
      if (highestMemberLimit > limit) {
        limit = highestMemberLimit;
      }
    }

    const used = await this.prisma.connection.count({
      where: {
        requesterUserId: userId,
        createdAt: { gte: sevenDaysAgo },
        status: {
          notIn: [ConnectionStatus.CANCELLED, ConnectionStatus.WITHDRAWN],
        },
      },
    });

    const remaining = Math.max(0, limit - used);

    return {
      limit,
      used,
      remaining,
      canConnect: remaining > 0,
      isVerified,
      resetsInDays: 7,
      windowDays: 7,
    };
  }

  /**
   * Send a direct connection request
   */
  async requestConnection(userId: string, dto: CreateConnectionDto) {
    // 0. Anti-Spam Quota Enforcement
    const quota = await this.getConnectionQuota(userId);
    if (!quota.canConnect) {
      throw new ForbiddenException(
        `Outreach quota exceeded: You have utilized all ${quota.limit} connection bridge requests for this 7-day period. Anti-spam governance safeguards decision makers to maintain exceptional response rates.`,
      );
    }

    // 1. Verify recipient profile exists and get owner user ID
    const recipientProfile = await this.prisma.professionalProfile.findUnique({
      where: { id: dto.recipientProfileId },
      include: { user: true, intents: true, company: true },
    });

    if (!recipientProfile) {
      throw new NotFoundException('Target professional profile not found');
    }

    if (recipientProfile.userId === userId) {
      throw new BadRequestException('You cannot connect with your own profile');
    }

    // Gaps 176, 190, 200: Executive Strategic Focus Mode / Sabbatical Guard
    if (recipientProfile.connectionAvailability === 'STEALTH') {
      throw new ForbiddenException(
        'Executive Strategic Focus Mode (Gap 200): This counterparty is currently on sabbatical or strategic focus mode. Cold inbound requests are temporarily paused to protect executive focus.'
      );
    }

    // Pre-qualification check against NOT_LOOKING_FOR intents
    if (recipientProfile.intents && recipientProfile.intents.length > 0) {
      const notLookingFor = recipientProfile.intents.filter(
        (i) => i.intentType === 'NOT_LOOKING_FOR',
      );
      const pitchLower = `${dto.businessReason || ''} ${dto.opportunityPitch || ''}`.toLowerCase();
      for (const nlf of notLookingFor) {
        const descTokens = nlf.description.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
        const match = descTokens.some((token) => pitchLower.includes(token));
        if (match && descTokens.length > 0) {
          this.logger.warn(
            `Connection request flagged for negative intent conflict: "${nlf.description}" vs pitch tokens`,
          );
        }
      }
    }

    // 2. Check for duplicate or existing connection state
    const existingConnection = await this.prisma.connection.findUnique({
      where: {
        requesterUserId_recipientProfileId: {
          requesterUserId: userId,
          recipientProfileId: dto.recipientProfileId,
        },
      },
    });

    if (recipientProfile.userId) {
      const reverseConnection = await this.prisma.connection.findFirst({
        where: {
          requesterUserId: recipientProfile.userId,
          recipientProfile: { userId },
        },
      });

      if (reverseConnection) {
        if (reverseConnection.status === ConnectionStatus.ACCEPTED) {
          throw new ConflictException('You are already connected with this professional');
        }
        if (reverseConnection.status === ConnectionStatus.PENDING) {
          throw new ConflictException(
            'This professional has already sent you a connection request. Please accept their pending request.'
          );
        }
      }
    }

    if (existingConnection) {
      if (existingConnection.status === ConnectionStatus.PENDING) {
        throw new ConflictException('A connection request is already pending for this professional');
      }
      if (existingConnection.status === ConnectionStatus.ACCEPTED) {
        throw new ConflictException('You are already connected with this professional');
      }
      if (existingConnection.status === ConnectionStatus.BLOCKED) {
        throw new ForbiddenException('Unable to send connection request to this recipient');
      }

      // Gap 179: Enforce 60-Day Re-Request Cooling-Off Period on Declined Requests
      if (existingConnection.status === ConnectionStatus.DECLINED && existingConnection.respondedAt) {
        const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
        const timeSinceDecline = Date.now() - new Date(existingConnection.respondedAt).getTime();
        if (timeSinceDecline < sixtyDaysInMs) {
          const daysLeft = Math.ceil((sixtyDaysInMs - timeSinceDecline) / (24 * 60 * 60 * 1000));
          throw new ForbiddenException(
            `Respectful Cadence Policy (Gap 179): Counterparty declined connection request. A 60-day cooling-off window is active (${daysLeft} days remaining) before new outreach can be initiated.`
          );
        }
      }

      const effectiveReason = dto.opportunityPitch
        ? `[${dto.businessReason}] ${dto.opportunityPitch}${dto.mutualGoals ? ` | Goals: ${dto.mutualGoals}` : ''}`
        : dto.businessReason;

      // If withdrawn or past cooling off, allow re-requesting by updating status back to PENDING
      const updated = await this.prisma.connection.update({
        where: { id: existingConnection.id },
        data: {
          status: ConnectionStatus.PENDING,
          businessReason: effectiveReason,
          respondedAt: null,
        },
        include: {
          recipientProfile: {
            include: { company: true },
          },
          requester: {
            include: { profile: true },
          },
        },
      });

      await this.logAudit(userId, 'CONNECTION_RE_REQUESTED', 'Connection', updated.id, {
        recipientProfileId: dto.recipientProfileId,
      });

      return updated;
    }

    const effectiveReason = dto.opportunityPitch
      ? `[${dto.businessReason}] ${dto.opportunityPitch}${dto.mutualGoals ? ` | Goals: ${dto.mutualGoals}` : ''}`
      : dto.businessReason;

    // 3. Create Connection
    const connection = await this.prisma.connection.create({
      data: {
        requesterUserId: userId,
        recipientProfileId: dto.recipientProfileId,
        businessReason: effectiveReason,
        status: ConnectionStatus.PENDING,
      },
      include: {
        recipientProfile: {
          include: { company: true },
        },
        requester: {
          include: { profile: true },
        },
      },
    });

    // 4. Audit Log
    await this.logAudit(userId, 'CONNECTION_REQUESTED', 'Connection', connection.id, {
      recipientProfileId: dto.recipientProfileId,
      businessReason: dto.businessReason,
    });

    // 5. Stage in-app real-time notification + email_outbox if recipient has user account
    if (recipientProfile.user?.id) {
      const requesterName = connection.requester.profile?.displayName || connection.requester.email;
      
      // Real-time In-app Notification (emits via SSE)
      try {
        await this.notificationsService.createNotification({
          userId: recipientProfile.user.id,
          actorId: userId,
          actorName: requesterName,
          type: NotificationType.CONNECTION_REQUEST,
          title: `New Business Opportunity Bridge`,
          body: `${requesterName} wants to connect: "${dto.businessReason.slice(0, 100)}..."`,
          actionUrl: (recipientProfile.company || (recipientProfile as any).currentCompanyId) ? '/company/pipeline' : '/app/requests',
          metadata: {
            connectionId: connection.id,
            requesterId: userId,
            businessReason: dto.businessReason,
          },
        });
      } catch (e) {
        this.logger.warn(`Failed to dispatch real-time connection notification: ${e}`);
      }

      if (recipientProfile.user?.email) {
        await this.prisma.emailOutbox.create({
          data: {
            toAddress: recipientProfile.user.email,
            templateKey: 'CONNECTION_REQUEST_RECEIVED',
            subject: 'New Connection Request on Project Setu',
            htmlBody: `<p>${requesterName} wants to connect: "${dto.businessReason}"</p>`,
          },
        });
      }

      // Action 5: Automatic Corporate Acknowledgment & SLA
      if (recipientProfile.company?.autoReplyEnabled) {
        try {
          const slaHours = recipientProfile.company.autoReplySlaHours || 24;
          const template =
            recipientProfile.company.autoReplyTemplate ||
            `Thank you for reaching out to ${recipientProfile.company.name}. Your institutional partnership inquiry has been routed to our departmental triage desk. An authorized lead will review your pitch within ${slaHours} hours.`;

          await this.notificationsService.createNotification({
            userId: userId,
            actorId: recipientProfile.userId || userId,
            actorName: recipientProfile.company.name,
            type: NotificationType.SYSTEM_ALERT,
            title: `⚡ Auto-Acknowledgment: ${recipientProfile.company.name}`,
            body: template,
            actionUrl: '/app/requests',
            metadata: { connectionId: connection.id, slaHours },
          });
        } catch (e) {
          this.logger.warn(`Failed to dispatch corporate auto-reply: ${e}`);
        }
      }
    }

    // Feature #24: Multi-Recipient ABM Bridge (Committee bridges)
    if (dto.recipientProfileIds && Array.isArray(dto.recipientProfileIds) && dto.recipientProfileIds.length > 0) {
      for (const additionalProfileId of dto.recipientProfileIds) {
        if (additionalProfileId !== dto.recipientProfileId) {
          try {
            await this.prisma.connection.upsert({
              where: {
                requesterUserId_recipientProfileId: {
                  requesterUserId: userId,
                  recipientProfileId: additionalProfileId,
                },
              },
              update: {
                businessReason: dto.businessReason,
                status: ConnectionStatus.PENDING,
              },
              create: {
                requesterUserId: userId,
                recipientProfileId: additionalProfileId,
                businessReason: dto.businessReason,
                status: ConnectionStatus.PENDING,
              },
            });
          } catch {
            // Ignore individual duplicate conflicts in ABM committee batch
          }
        }
      }
    }

    return connection;
  }

  /**
   * Get all active connections for current user
   */
  async getActiveConnections(userId: string) {
    const userProfile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });

    // An active connection is either:
    // a) User requested it and status is ACCEPTED
    // b) User received it on their profile and status is ACCEPTED
    const conditions: any[] = [
      { requesterUserId: userId, status: ConnectionStatus.ACCEPTED },
    ];

    if (userProfile) {
      conditions.push({ recipientProfileId: userProfile.id, status: ConnectionStatus.ACCEPTED });
    }

    const connections = await this.prisma.connection.findMany({
      where: { OR: conditions },
      include: {
        requester: {
          include: { profile: { include: { company: true } } },
        },
        recipientProfile: {
          include: { user: true, company: true },
        },
      },
      orderBy: { respondedAt: 'desc' },
    });

    return connections.map((conn) => {
      const isRequester = conn.requesterUserId === userId;
      const partner = isRequester
        ? {
            userId: conn.recipientProfile.userId,
            fullName: conn.recipientProfile.displayName,
            headline: conn.recipientProfile.headline,
            function: conn.recipientProfile.function,
            companyName: conn.recipientProfile.company?.name || null,
            profileId: conn.recipientProfile.id,
            email: conn.recipientProfile.user?.email || null,
            phoneNumber: conn.recipientProfile.user?.phoneNumber || conn.recipientProfile.phoneNumber || null,
          }
        : {
            userId: conn.requester.id,
            fullName: conn.requester.profile?.displayName || conn.requester.email,
            headline: conn.requester.profile?.headline || null,
            function: conn.requester.profile?.function || null,
            companyName: conn.requester.profile?.company?.name || null,
            profileId: conn.requester.profile?.id || null,
            email: conn.requester.email || null,
            phoneNumber: conn.requester.phoneNumber || conn.requester.profile?.phoneNumber || null,
          };

      return {
        id: conn.id,
        businessReason: conn.businessReason,
        status: conn.status,
        connectedAt: conn.respondedAt || conn.createdAt,
        partner,
      };
    });
  }

  /**
   * Retrieve available connectors/intermediaries for warm introductions
   * Returns active 1st-degree connections and verified platform facilitators.
   */
  async getAvailableConnectors(userId: string) {
    const activeConns = await this.getActiveConnections(userId);
    const connectorsMap = new Map<string, any>();

    for (const conn of activeConns) {
      if (conn.partner?.userId && conn.partner.userId !== userId) {
        connectorsMap.set(conn.partner.userId, {
          userId: conn.partner.userId,
          profileId: conn.partner.profileId,
          displayName: conn.partner.fullName || 'Verified Connection',
          currentTitle: conn.partner.headline || conn.partner.function || 'Commercial Partner',
          companyName: conn.partner.companyName || 'Enterprise Partner',
          isMutualConnection: true,
        });
      }
    }

    // Always ensure at least 4 trusted facilitators are available
    if (connectorsMap.size < 4) {
      const platformConnectors = await this.prisma.professionalProfile.findMany({
        where: {
          userId: { not: null, notIn: [userId, ...Array.from(connectorsMap.keys())] },
          verificationStatus: 'VERIFIED',
        },
        take: 6 - connectorsMap.size,
        include: { company: true },
        orderBy: [{ completenessScore: 'desc' }, { createdAt: 'desc' }],
      });

      for (const p of platformConnectors) {
        if (p.userId && !connectorsMap.has(p.userId)) {
          connectorsMap.set(p.userId, {
            userId: p.userId,
            profileId: p.id,
            displayName: p.displayName,
            currentTitle: p.currentTitle || p.headline || 'Senior Executive Facilitator',
            companyName: p.company?.name || 'Global Enterprise',
            isMutualConnection: false,
          });
        }
      }
    }

    return Array.from(connectorsMap.values());
  }

  /**
   * Get all incoming and outgoing connection requests
   */
  async getConnectionRequests(userId: string) {
    const userProfile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });

    // 14-day Auto-Decay for Stale Pending Requests (Feature Gap 155)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    try {
      await this.prisma.connection.updateMany({
        where: {
          status: ConnectionStatus.PENDING,
          createdAt: { lt: fourteenDaysAgo },
        },
        data: {
          status: ConnectionStatus.CANCELLED,
          respondedAt: new Date(),
        },
      });
    } catch {}

    const outgoing = await this.prisma.connection.findMany({
      where: { requesterUserId: userId },
      include: {
        requester: {
          select: { id: true, email: true, phoneNumber: true },
        },
        recipientProfile: {
          include: {
            company: true,
            user: { select: { id: true, email: true, phoneNumber: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let incoming: any[] = [];
    if (userProfile) {
      incoming = await this.prisma.connection.findMany({
        where: { recipientProfileId: userProfile.id },
        include: {
          requester: {
            include: { profile: { include: { company: true } } },
          },
          recipientProfile: {
            include: {
              company: true,
              user: { select: { id: true, email: true, phoneNumber: true } },
            },
          },
          delegatedToProfile: {
            include: { company: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const mapRequestItem = (conn: any, isOutgoing: boolean) => {
      const meta = parseConnectionMeta(conn.declineNote);
      const elapsedDays = Math.floor((Date.now() - new Date(conn.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, 14 - elapsedDays);
      const isExpiringSoon = conn.status === ConnectionStatus.PENDING && daysRemaining <= 3;
      const canWithdraw = isOutgoing && conn.status === ConnectionStatus.PENDING;
      const isWithdrawableWithQuota = canWithdraw && (Date.now() - new Date(conn.createdAt).getTime()) <= 24 * 60 * 60 * 1000;
      const reminderCount = meta.reminderCount || 0;
      const canRemind = isOutgoing && conn.status === ConnectionStatus.PENDING && reminderCount === 0;

      const requesterPhone =
        conn.requester?.phoneNumber ||
        conn.requester?.profile?.phoneNumber ||
        null;

      const recipientPhone =
        conn.recipientProfile?.user?.phoneNumber ||
        conn.recipientProfile?.phoneNumber ||
        null;

      return {
        ...conn,
        requesterPhone,
        recipientPhone,
        partnerPhone: isOutgoing ? recipientPhone : requesterPhone,
        requester: conn.requester
          ? {
              ...conn.requester,
              phoneNumber: requesterPhone,
              profile: conn.requester.profile
                ? {
                    ...conn.requester.profile,
                    phoneNumber: requesterPhone,
                  }
                : undefined,
            }
          : undefined,
        recipientProfile: conn.recipientProfile
          ? {
              ...conn.recipientProfile,
              phoneNumber: recipientPhone,
            }
          : undefined,
        clarificationQuestion: meta.clarificationQuestion || null,
        clarificationAnswer: meta.clarificationAnswer || null,
        remindedAt: meta.remindedAt || null,
        reminderCount,
        reminderNote: meta.reminderNote || null,
        daysRemaining,
        isExpiringSoon,
        canRemind,
        canWithdraw,
        isWithdrawableWithQuota,
      };
    };

    return {
      incoming: incoming.map((c) => mapRequestItem(c, false)),
      outgoing: outgoing.map((c) => mapRequestItem(c, true)),
    };
  }

  /**
   * Feature #7: Smart Wrong-Contact Handover - Get verified colleague candidates from company
   */
  async getColleaguesForHandover(userId: string) {
    const userProfile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
      include: { company: true },
    });

    if (!userProfile?.currentCompanyId) {
      return [];
    }

    // Retrieve peers belonging to the same organization who have active professional profiles
    const colleagues = await this.prisma.professionalProfile.findMany({
      where: {
        currentCompanyId: userProfile.currentCompanyId,
        id: { not: userProfile.id },
      },
      include: {
        corporateMandates: {
          where: { isRevoked: false },
        },
      },
      take: 12,
    });

    return colleagues.map((c) => ({
      id: c.id,
      displayName: c.displayName,
      currentTitle: c.currentTitle || 'Corporate Executive',
      function: c.function || 'Commercial Operations',
      seniority: c.seniority || 'Director',
      city: c.city,
      countryCode: c.countryCode,
      hasMandate: c.corporateMandates.length > 0,
      activeMandateScope: c.corporateMandates[0]?.categoryScope || null,
    }));
  }

  /**
   * Respond to a connection request (Accept or Decline)
   */
  async respondConnection(
    userId: string,
    connectionId: string,
    action: ConnectionResponseAction,
    declineReasonCode?: string,
    declineNote?: string,
  ) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
      include: { recipientProfile: true, requester: { include: { profile: true } } },
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found');
    }

    // Only recipient can accept/decline
    if (connection.recipientProfile.userId !== userId) {
      throw new ForbiddenException('Only the recipient of this connection request can respond');
    }

    if (connection.status !== ConnectionStatus.PENDING) {
      throw new BadRequestException(`Cannot respond to connection in status ${connection.status}`);
    }

    const nextStatus =
      action === ConnectionResponseAction.ACCEPT
        ? ConnectionStatus.ACCEPTED
        : ConnectionStatus.DECLINED;

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: nextStatus,
        respondedAt: new Date(),
        declineReasonCode: action === ConnectionResponseAction.DECLINE ? declineReasonCode : undefined,
        declineNote: action === ConnectionResponseAction.DECLINE ? declineNote : undefined,
      },
      include: {
        recipientProfile: { include: { company: true } },
        requester: { include: { profile: true } },
      },
    });

    await this.logAudit(userId, `CONNECTION_${nextStatus}`, 'Connection', connectionId, {
      requesterUserId: connection.requesterUserId,
      declineReasonCode,
      declineNote,
    });

    // Notify requester in-app and email
    if (action === ConnectionResponseAction.ACCEPT) {
      try {
        await this.notificationsService.createNotification({
          userId: connection.requesterUserId,
          actorId: userId,
          actorName: connection.recipientProfile.displayName,
          type: NotificationType.CONNECTION_ACCEPTED,
          title: 'Opportunity Bridge Accepted',
          body: `${connection.recipientProfile.displayName} accepted your connection opportunity! You can now start direct messaging.`,
          actionUrl: '/app/messages',
          metadata: { connectionId },
        });
      } catch (e) {
        this.logger.warn(`Failed to dispatch real-time connection acceptance notification: ${e}`);
      }

      // F4: Auto-spawn Setu Deal Room on connection accepted
      try {
        const existingRoom = await this.prisma.dealRoom.findUnique({ where: { connectionId } });
        if (!existingRoom) {
          const room = await this.prisma.dealRoom.create({
            data: {
              connectionId,
              initiatorUserId: connection.requesterUserId,
              partnerUserId: userId,
              title: (connection.businessReason || 'New Partnership').slice(0, 120),
            },
          });
          // Notify both parties about Deal Room creation
          await this.prisma.notification.createMany({
            data: [
              {
                userId: connection.requesterUserId,
                type: 'DEAL_ROOM_CREATED',
                title: '🏗️ Deal Room Created',
                body: 'Your connection was accepted! A structured Deal Room is ready — set goals, track milestones, and close the deal.',
                actionUrl: `/app/deal-rooms/${room.id}`,
                actorId: userId,
                actorName: connection.recipientProfile.displayName,
              },
              {
                userId,
                type: 'DEAL_ROOM_CREATED',
                title: '🏗️ Deal Room Created',
                body: 'A Deal Room has been created for your new connection. Start collaborating!',
                actionUrl: `/app/deal-rooms/${room.id}`,
                actorId: connection.requesterUserId,
              },
            ],
          });
        }
      } catch (e) {
        // Non-blocking: DealRoom creation failure should not break connection acceptance
        this.logger && (this.logger as any).warn?.(`DealRoom spawn failed for connection ${connectionId}: ${e}`);
      }

      if (connection.requester.email) {
        await this.prisma.emailOutbox.create({
          data: {
            toAddress: connection.requester.email,
            templateKey: 'CONNECTION_REQUEST_ACCEPTED',
            subject: 'Connection Request Accepted on Project Setu',
            htmlBody: `<p>${connection.recipientProfile.displayName} accepted your connection request.</p>`,
          },
        });
      }
    } else {
      try {
        await this.notificationsService.createNotification({
          userId: connection.requesterUserId,
          actorId: userId,
          actorName: connection.recipientProfile.displayName,
          type: NotificationType.CONNECTION_DECLINED,
          title: 'Connection Opportunity Update',
          body: `${connection.recipientProfile.displayName} was unable to accept your connection at this time.`,
          actionUrl: '/app/connections',
          metadata: { connectionId },
        });
      } catch (e) {
        this.logger.warn(`Failed to dispatch real-time connection decline notification: ${e}`);
      }
    }

    return updated;
  }

  /**
   * Ignore an incoming connection request with reason
   */
  async ignoreConnection(userId: string, connectionId: string, reason?: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
      include: { recipientProfile: true },
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found');
    }

    if (connection.recipientProfile.userId !== userId) {
      throw new ForbiddenException('Only the recipient of this connection request can ignore it');
    }

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: ConnectionStatus.CANCELLED,
        respondedAt: new Date(),
        declineReasonCode: 'IGNORED',
        declineNote: reason || 'Ignored by recipient',
      },
    });

    await this.logAudit(userId, 'CONNECTION_IGNORED', 'Connection', connectionId, {
      reason: reason || 'Ignored by recipient',
    });

    return updated;
  }

  /**
   * Re-route / Delegate opportunity bridge to a colleague in the same organization
   */
  async delegateConnection(
    userId: string,
    connectionId: string,
    targetProfileId: string,
    delegationNote?: string,
    acceptAndConnect?: boolean,
  ) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        recipientProfile: { include: { company: true } },
        requester: { include: { profile: true } },
      },
    });

    if (!connection) throw new NotFoundException('Connection request not found');

    if (connection.recipientProfile.userId !== userId) {
      throw new ForbiddenException('Only the current recipient can delegate this opportunity');
    }

    const colleagueProfile = await this.prisma.professionalProfile.findUnique({
      where: { id: targetProfileId },
      include: { user: true, company: true },
    });

    if (!colleagueProfile) throw new NotFoundException('Colleague profile not found');

    const shouldAccept = Boolean(acceptAndConnect);

    // Update connection recipient to the colleague (and accept if specified)
    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        recipientProfileId: targetProfileId,
        delegatedToProfileId: targetProfileId,
        delegatedFromUserId: userId,
        delegationNote: delegationNote || 'Opportunity re-routed to appropriate functional owner.',
        ...(shouldAccept ? { status: ConnectionStatus.ACCEPTED, respondedAt: new Date() } : {}),
      },
      include: {
        recipientProfile: true,
        requester: { include: { profile: { include: { company: true } } } },
      },
    });

    // Notify colleague
    if (colleagueProfile.userId) {
      await this.prisma.notification.create({
        data: {
          userId: colleagueProfile.userId,
          actorId: userId,
          actorName: connection.recipientProfile.displayName,
          type: shouldAccept ? NotificationType.CONNECTION_ACCEPTED : 'OPPORTUNITY_DELEGATED',
          title: shouldAccept ? 'Opportunity Bridge Assigned & Accepted' : 'Opportunity Forwarded by Colleague',
          body: shouldAccept
            ? `${connection.recipientProfile.displayName} accepted and assigned an opportunity from ${connection.requester.profile?.displayName || connection.requester.email} to your desk.`
            : `${connection.recipientProfile.displayName} re-routed a commercial opportunity to you: "${delegationNote || 'Relevant to your department'}"`,
          actionUrl: '/app/connections',
        },
      });
    }

    // Notify original requester
    await this.prisma.notification.create({
      data: {
        userId: connection.requesterUserId,
        actorId: userId,
        actorName: connection.recipientProfile.displayName,
        type: shouldAccept ? NotificationType.CONNECTION_ACCEPTED : 'OPPORTUNITY_DELEGATED',
        title: shouldAccept ? 'Opportunity Bridge Accepted by Team' : 'Opportunity Bridge Re-routed to Specialist',
        body: shouldAccept
          ? `${connection.recipientProfile.displayName} accepted your connection and assigned ${colleagueProfile.displayName} (${colleagueProfile.currentTitle || 'Lead'}) as your direct liaison.`
          : `${connection.recipientProfile.displayName} delegated your opportunity to ${colleagueProfile.displayName} (${colleagueProfile.currentTitle || 'Lead'}) for functional evaluation.`,
        actionUrl: '/app/connections',
      },
    });

    // If accepted and Deal Room does not exist, spawn it
    if (shouldAccept) {
      try {
        const existingRoom = await this.prisma.dealRoom.findUnique({ where: { connectionId } });
        if (!existingRoom && colleagueProfile.userId) {
          await this.prisma.dealRoom.create({
            data: {
              connectionId,
              initiatorUserId: connection.requesterUserId,
              partnerUserId: colleagueProfile.userId,
              title: (connection.businessReason || 'New Strategic Partnership').slice(0, 120),
            },
          });
        }
      } catch (err) {
        this.logger.warn(`Failed to auto-spawn deal room on delegated accept: ${err}`);
      }
    }

    await this.logAudit(userId, shouldAccept ? 'OPPORTUNITY_ACCEPTED_AND_DELEGATED' : 'OPPORTUNITY_DELEGATED', 'Connection', connectionId, {
      fromUserId: userId,
      toProfileId: targetProfileId,
      delegationNote,
      accepted: shouldAccept,
    });

    return updated;
  }

  /**
   * Schedule a smart follow-up reminder for an opportunity
   */
  async scheduleFollowUp(
    userId: string,
    connectionId: string,
    followUpDate: Date,
    reminderNote?: string,
  ) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
      include: { recipientProfile: true },
    });

    if (!connection) throw new NotFoundException('Connection request not found');

    if (connection.recipientProfile.userId !== userId) {
      throw new ForbiddenException('Only the opportunity recipient can schedule reminders');
    }

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        followUpDate,
        declineNote: reminderNote ? `[Reminder Note]: ${reminderNote}` : undefined,
      },
    });

    await this.logAudit(userId, 'FOLLOWUP_SCHEDULED', 'Connection', connectionId, {
      followUpDate,
      reminderNote,
    });

    return updated;
  }

  /**
   * Cancel an outgoing pending connection request
   */
  async cancelConnection(userId: string, connectionId: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found');
    }

    if (connection.requesterUserId !== userId) {
      throw new ForbiddenException('You can only cancel connection requests you sent');
    }

    if (connection.status !== ConnectionStatus.PENDING) {
      throw new BadRequestException(`Cannot cancel request in status ${connection.status}`);
    }

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: ConnectionStatus.CANCELLED,
        respondedAt: new Date(),
      },
    });

    await this.logAudit(userId, 'CONNECTION_CANCELLED', 'Connection', connectionId, {});

    return updated;
  }

  /**
   * Feature Gap 157: Graceful Withdrawal with Quota Recovery
   * If withdrawn within 24 hours of creation, returns quota allocation (+1).
   */
  async withdrawConnection(userId: string, connectionId: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found');
    }

    if (connection.requesterUserId !== userId) {
      throw new ForbiddenException('You can only withdraw connection requests you sent');
    }

    if (connection.status !== ConnectionStatus.PENDING) {
      throw new BadRequestException(`Cannot withdraw request in status ${connection.status}`);
    }

    const isWithin24h = Date.now() - new Date(connection.createdAt).getTime() <= 24 * 60 * 60 * 1000;

    const existingMeta = parseConnectionMeta(connection.declineNote);
    const updatedMeta = JSON.stringify({
      ...existingMeta,
      withdrawnAt: new Date().toISOString(),
      quotaRestored: isWithin24h,
    });

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: ConnectionStatus.WITHDRAWN,
        respondedAt: new Date(),
        declineNote: updatedMeta,
      },
    });

    await this.logAudit(userId, 'CONNECTION_WITHDRAWN', 'Connection', connectionId, {
      quotaRestored: isWithin24h,
      hoursElapsed: (Date.now() - new Date(connection.createdAt).getTime()) / (1000 * 60 * 60),
    });

    return {
      success: true,
      quotaRestored: isWithin24h,
      message: isWithin24h
        ? 'Connection bridge withdrawn within 24 hours. Your weekly quota allocation has been restored (+1).'
        : 'Connection bridge withdrawn successfully.',
      connection: updated,
    };
  }

  /**
   * Disconnect an active connection cleanly without destroying message/deal room audit history
   */
  async disconnectConnection(userId: string, connectionId: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        recipientProfile: true,
        requester: true,
      },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    const userProfile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });

    const isRequester = connection.requesterUserId === userId;
    const isRecipient =
      connection.recipientProfile.userId === userId ||
      connection.recipientProfileId === userProfile?.id;

    if (!isRequester && !isRecipient) {
      throw new ForbiddenException('You can only disconnect connections you belong to');
    }

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: ConnectionStatus.CANCELLED,
        declineNote: JSON.stringify({
          disconnectedAt: new Date().toISOString(),
          disconnectedByUserId: userId,
        }),
      },
    });

    await this.logAudit(userId, 'CONNECTION_DISCONNECTED', 'Connection', connectionId, {
      disconnectedBy: userId,
    });

    return {
      success: true,
      message: 'Connection disconnected cleanly.',
      connectionId,
    };
  }

  /**
   * Disconnect active connection by target profile ID
   */
  async disconnectByProfileId(userId: string, targetProfileId: string) {
    const userProfile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });

    const targetProfile = await this.prisma.professionalProfile.findUnique({
      where: { id: targetProfileId },
    });

    if (!targetProfile) {
      throw new NotFoundException('Target profile not found');
    }

    const directConn = await this.prisma.connection.findFirst({
      where: {
        status: ConnectionStatus.ACCEPTED,
        OR: [
          { requesterUserId: userId, recipientProfileId: targetProfileId },
          ...(targetProfile.userId && userProfile
            ? [{ requesterUserId: targetProfile.userId, recipientProfileId: userProfile.id }]
            : []),
        ],
      },
    });

    if (!directConn) {
      throw new NotFoundException('No active accepted connection found with this profile');
    }

    return this.disconnectConnection(userId, directConn.id);
  }

  /**
   * Enterprise Network Metrics Engine:
   * Returns connection status, connection age (days), total connections (tiered 100+, 500+, 1000+),
   * and mutual connections breakdown with avatar preview.
   */
  async getProfileNetworkMetrics(viewerUserId: string, targetProfileId: string) {
    const viewerProfile = await this.prisma.professionalProfile.findUnique({
      where: { userId: viewerUserId },
    });

    const targetProfile = await this.prisma.professionalProfile.findUnique({
      where: { id: targetProfileId },
      include: {
        company: true,
        user: true,
      },
    });

    if (!targetProfile) {
      throw new NotFoundException('Profile not found');
    }

    // 1. Connection status between viewer and target
    let connectionStatus: 'NONE' | 'PENDING' | 'CONNECTED' | 'DECLINED' | 'WITHDRAWN' = 'NONE';
    let connectedAt: string | null = null;
    let connectedDays = 0;
    let connectionId: string | null = null;

    const directConn = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requesterUserId: viewerUserId, recipientProfileId: targetProfileId },
          ...(targetProfile.userId && viewerProfile
            ? [{ requesterUserId: targetProfile.userId, recipientProfileId: viewerProfile.id }]
            : []),
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (directConn) {
      connectionId = directConn.id;
      if (directConn.status === ConnectionStatus.ACCEPTED) {
        connectionStatus = 'CONNECTED';
        connectedAt = (directConn.respondedAt || directConn.createdAt).toISOString();
        const diffMs = Date.now() - new Date(connectedAt).getTime();
        connectedDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      } else if (directConn.status === ConnectionStatus.PENDING) {
        connectionStatus = 'PENDING';
      } else if (directConn.status === ConnectionStatus.DECLINED) {
        connectionStatus = 'DECLINED';
      } else if (
        directConn.status === ConnectionStatus.WITHDRAWN ||
        directConn.status === ConnectionStatus.CANCELLED
      ) {
        connectionStatus = 'WITHDRAWN';
      }
    }

    // 2. Total Connections Tier for Target
    let actualAcceptedCount = 0;
    if (targetProfile.userId) {
      actualAcceptedCount = await this.prisma.connection.count({
        where: {
          status: ConnectionStatus.ACCEPTED,
          OR: [
            { requesterUserId: targetProfile.userId },
            { recipientProfileId: targetProfile.id },
          ],
        },
      });
    } else {
      actualAcceptedCount = await this.prisma.connection.count({
        where: {
          recipientProfileId: targetProfile.id,
          status: ConnectionStatus.ACCEPTED,
        },
      });
    }

    // 100% Genuine Database Accepted Connection Count
    const totalCount = actualAcceptedCount;
    const formatTier = (c: number): string => {
      if (c === 0) return '0';
      if (c < 100) return `${c}`;
      if (c < 500) return '100+';
      if (c < 1000) return '500+';
      return '1000+';
    };
    const totalConnectionsTiered = formatTier(totalCount);

    // 3. Mutual Connections
    const viewerConns = await this.prisma.connection.findMany({
      where: {
        status: ConnectionStatus.ACCEPTED,
        OR: [
          { requesterUserId: viewerUserId },
          ...(viewerProfile ? [{ recipientProfileId: viewerProfile.id }] : []),
        ],
      },
      include: {
        requester: { include: { profile: { include: { company: true } } } },
        recipientProfile: { include: { company: true, user: true } },
      },
    });

    const viewerPeerProfiles: any[] = [];
    for (const c of viewerConns) {
      if (c.requesterUserId === viewerUserId) {
        if (c.recipientProfile && c.recipientProfile.id !== targetProfileId) {
          viewerPeerProfiles.push(c.recipientProfile);
        }
      } else {
        if (c.requester?.profile && c.requester.profile.id !== targetProfileId) {
          viewerPeerProfiles.push(c.requester.profile);
        }
      }
    }

    let mutualProfiles: any[] = [];
    if (targetProfile.userId) {
      const targetConns = await this.prisma.connection.findMany({
        where: {
          status: ConnectionStatus.ACCEPTED,
          OR: [
            { requesterUserId: targetProfile.userId },
            { recipientProfileId: targetProfile.id },
          ],
        },
        select: {
          requesterUserId: true,
          recipientProfile: { select: { userId: true, id: true } },
        },
      });

      const targetPeerUserIds = new Set<string>();
      targetConns.forEach((tc) => {
        if (tc.requesterUserId !== targetProfile.userId) targetPeerUserIds.add(tc.requesterUserId);
        if (tc.recipientProfile?.userId && tc.recipientProfile.userId !== targetProfile.userId) {
          targetPeerUserIds.add(tc.recipientProfile.userId);
        }
      });

      mutualProfiles = viewerPeerProfiles.filter(
        (vp) => vp.userId && targetPeerUserIds.has(vp.userId)
      );
    }

    const mutualCount = mutualProfiles.length;
    const mutualTiered = formatTier(mutualCount);
    const mutualPreview = mutualProfiles.slice(0, 3).map((p) => ({
      id: p.id,
      displayName: p.displayName,
      currentTitle: p.currentTitle || p.headline || 'Executive Partner',
      companyName: p.company?.name || 'Enterprise',
      avatarUrl: p.avatarUrl || null,
    }));

    return {
      profileId: targetProfileId,
      connectionStatus,
      connectionId,
      connectedAt,
      connectedDays,
      totalConnections: totalCount,
      totalConnectionsTiered,
      mutualCount,
      mutualTiered,
      mutualPreview,
    };
  }

  /**
   * Return full list of mutual connections between viewer and target
   */
  async getMutualConnections(viewerUserId: string, targetProfileId: string) {
    const metrics = await this.getProfileNetworkMetrics(viewerUserId, targetProfileId);
    return {
      profileId: targetProfileId,
      totalMutuals: metrics.mutualCount,
      mutualTiered: metrics.mutualTiered,
      mutuals: metrics.mutualPreview,
    };
  }

  /**
   * Feature Gap 151 & 152: Anti-Spam Cadence Engine & Non-Intrusive Gentle Reminder
   * Enforces exactly 1 polite reminder nudge to prevent harassment and recipient fatigue.
   */
  async remindConnection(userId: string, connectionId: string, reminderNote?: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        recipientProfile: { include: { user: true } },
        requester: { include: { profile: true } },
      },
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found');
    }

    if (connection.requesterUserId !== userId) {
      throw new ForbiddenException('You can only send reminders for connection requests you initiated');
    }

    if (connection.status !== ConnectionStatus.PENDING) {
      throw new BadRequestException(`Cannot remind connection in status ${connection.status}`);
    }

    const meta = parseConnectionMeta(connection.declineNote);
    const reminderCount = meta.reminderCount || 0;

    if (reminderCount >= 1) {
      throw new BadRequestException(
        'Anti-spam cadence limit reached: Exactly 1 gentle reminder allowed per connection bridge to safeguard executive responsiveness.',
      );
    }

    const updatedMeta = JSON.stringify({
      ...meta,
      reminderCount: reminderCount + 1,
      remindedAt: new Date().toISOString(),
      reminderNote: reminderNote || 'Gentle follow-up regarding commercial opportunity.',
    });

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        followUpDate: new Date(),
        declineNote: updatedMeta,
      },
    });

    const requesterName = connection.requester.profile?.displayName || connection.requester.email;

    if (connection.recipientProfile.user?.id) {
      await this.prisma.notification.create({
        data: {
          userId: connection.recipientProfile.user.id,
          actorId: userId,
          actorName: requesterName,
          type: NotificationType.FOLLOWUP_REMINDER,
          title: 'Gentle Follow-Up: Commercial Opportunity Bridge',
          body: `${requesterName} sent a gentle follow-up regarding the connection bridge: "${connection.businessReason.slice(0, 90)}..."`,
          actionUrl: '/app/requests',
          metadata: JSON.stringify({ connectionId, reminderNote }),
        },
      });
    }

    await this.logAudit(userId, 'CONNECTION_REMINDED', 'Connection', connectionId, {
      reminderCount: reminderCount + 1,
      reminderNote,
    });

    return {
      success: true,
      message: 'Gentle follow-up notification dispatched. Cooldown activated to prevent recipient fatigue.',
      remindedAt: new Date(),
      connection: updated,
    };
  }

  /**
   * Feature Gap 154: Clarification Request Before Acceptance/Rejection
   * Recipient asks 1 targeted clarifying question before making a commitment.
   */
  async clarifyConnection(userId: string, connectionId: string, question: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        recipientProfile: true,
        requester: { include: { profile: true } },
      },
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found');
    }

    if (connection.recipientProfile.userId !== userId) {
      throw new ForbiddenException('Only the recipient of this connection request can ask for clarification');
    }

    if (connection.status !== ConnectionStatus.PENDING) {
      throw new BadRequestException(`Cannot request clarification on request in status ${connection.status}`);
    }

    const meta = parseConnectionMeta(connection.declineNote);
    const updatedMeta = JSON.stringify({
      ...meta,
      clarificationQuestion: question.trim(),
      clarificationAskedAt: new Date().toISOString(),
    });

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        declineReasonCode: 'CLARIFICATION_REQUESTED',
        declineNote: updatedMeta,
      },
    });

    const recipientName = connection.recipientProfile.displayName;

    await this.prisma.notification.create({
      data: {
        userId: connection.requesterUserId,
        actorId: userId,
        actorName: recipientName,
        type: NotificationType.SYSTEM_ALERT,
        title: 'Clarification Requested on Opportunity Bridge',
        body: `${recipientName} requested clarification before accepting: "${question.slice(0, 100)}"`,
        actionUrl: '/app/requests',
        metadata: JSON.stringify({ connectionId, question }),
      },
    });

    await this.logAudit(userId, 'CONNECTION_CLARIFICATION_REQUESTED', 'Connection', connectionId, {
      question,
    });

    return {
      success: true,
      message: 'Clarification question transmitted to requester.',
      connection: updated,
    };
  }

  /**
   * Feature Gap 154: Answer Clarification Question
   */
  async answerClarification(userId: string, connectionId: string, answer: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        recipientProfile: { include: { user: true } },
        requester: { include: { profile: true } },
      },
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found');
    }

    if (connection.requesterUserId !== userId) {
      throw new ForbiddenException('Only the requester can answer the clarification');
    }

    const meta = parseConnectionMeta(connection.declineNote);
    const updatedMeta = JSON.stringify({
      ...meta,
      clarificationAnswer: answer.trim(),
      clarificationAnsweredAt: new Date().toISOString(),
    });

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        declineReasonCode: 'CLARIFICATION_ANSWERED',
        declineNote: updatedMeta,
      },
    });

    const requesterName = connection.requester.profile?.displayName || connection.requester.email;

    if (connection.recipientProfile.user?.id) {
      await this.prisma.notification.create({
        data: {
          userId: connection.recipientProfile.user.id,
          actorId: userId,
          actorName: requesterName,
          type: NotificationType.SYSTEM_ALERT,
          title: 'Clarification Answer Received',
          body: `${requesterName} answered your question: "${answer.slice(0, 100)}"`,
          actionUrl: '/app/requests',
          metadata: JSON.stringify({ connectionId, answer }),
        },
      });
    }

    await this.logAudit(userId, 'CONNECTION_CLARIFICATION_ANSWERED', 'Connection', connectionId, {
      answer,
    });

    return {
      success: true,
      message: 'Clarification response delivered to recipient.',
      connection: updated,
    };
  }

  /**
   * Feature Gap 201 & 203: AI-Assisted Smart Draft Generator
   * Produces 3 tailored, institutional-grade 300-char notes tailored to recipient demand.
   */
  async generateSmartDrafts(userId: string, dto: SmartDraftDto) {
    const [requester, recipientProfile] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: { include: { company: true, intents: true } } },
      }),
      this.prisma.professionalProfile.findUnique({
        where: { id: dto.recipientProfileId },
        include: { company: true, intents: true },
      }),
    ]);

    if (!recipientProfile) {
      throw new NotFoundException('Recipient profile not found');
    }

    const requesterCompany = requester?.profile?.company?.name || 'our organization';
    const requesterOffering = requester?.profile?.intents?.find((i) => i.intentType === 'OFFERING')?.description || 'commercial distribution & expansion capabilities';

    const recipientName = recipientProfile.displayName;
    const recipientCompany = recipientProfile.company?.name || 'your enterprise';
    const recipientTitle = recipientProfile.currentTitle || 'Commercial Lead';
    const recipientDemand = recipientProfile.intents?.find((i) => i.intentType === 'LOOKING_FOR')?.description || 'regional commercial partnerships';

    const recipientFirst = recipientName.split(' ')[0] || recipientName;

    // Craft 3 institutional-grade 300-char max drafts:
    const draft1 = `Hi ${recipientFirst}, noticed ${recipientCompany}'s focus on ${recipientDemand.slice(0, 42)}. At ${requesterCompany}, we specialize in ${requesterOffering.slice(0, 42)}. Would you be open to an exploratory 15-min discovery call?`;

    const draft2 = `Hi ${recipientFirst}, as ${recipientTitle} at ${recipientCompany}, would you be open to connecting? We are initiating regional alliances in ${recipientProfile.city || 'APAC'} and see strategic synergy between our organizations.`;

    const draft3 = `Hi ${recipientFirst}, reviewing commercial procurement & supply routes with ${recipientCompany}. We have verified capacity and compliance readiness to support your objectives. Let's explore collaboration.`;

    const drafts = [
      {
        id: 'direct_synergy',
        title: 'Direct Synergy Hook',
        label: 'Direct Synergy Hook',
        category: 'Demand & Supply Reciprocity',
        text: draft1.slice(0, 300),
        charCount: Math.min(draft1.length, 300),
        chars: Math.min(draft1.length, 300),
      },
      {
        id: 'strategic_alliance',
        title: 'Executive Strategic Alliance',
        label: 'Executive Strategic Alliance',
        category: 'C-Level Corporate Synergy',
        text: draft2.slice(0, 300),
        charCount: Math.min(draft2.length, 300),
        chars: Math.min(draft2.length, 300),
      },
      {
        id: 'procurement_rfp',
        title: 'Procurement & RFP Discovery',
        label: 'Procurement & RFP Discovery',
        category: 'Verified Commercial Sourcing',
        text: draft3.slice(0, 300),
        charCount: Math.min(draft3.length, 300),
        chars: Math.min(draft3.length, 300),
      },
    ];

    return {
      recipientName,
      recipientCompany,
      recipientTitle,
      recipientDemand,
      drafts,
    };
  }

  /**
   * Feature Gap 202 & 204: Prohibited Phrasing & Spam Linter
   * Flags pushy sales phrases and enforces strict 300-char institutional conciseness.
   */
  async lintNote(dto: LintNoteDto) {
    const text = (dto.note || '').trim();
    const textLower = text.toLowerCase();

    const PROHIBITED_SPAM_PATTERNS = [
      { pattern: 'guaranteed roi', replacement: 'projected commercial returns' },
      { pattern: 'cheap', replacement: 'cost-effective / competitive commercial terms' },
      { pattern: 'buy now', replacement: 'explore exploratory discovery' },
      { pattern: 'exclusive offer', replacement: 'targeted strategic proposition' },
      { pattern: 'unlimited leads', replacement: 'qualified B2B network distribution' },
      { pattern: 'free trial', replacement: 'pilot deployment / proof-of-concept' },
      { pattern: 'miracle', replacement: 'proven high-reliability solution' },
      { pattern: 'click here', replacement: 'review attached documentation' },
      { pattern: 'discount code', replacement: 'commercial pricing schedule' },
      { pattern: 'synergy', replacement: 'bilateral alignment' },
      { pattern: '100% free', replacement: 'complimentary introductory evaluation' },
      { pattern: 'cold call', replacement: 'warm verified outreach' },
      { pattern: 'mass email', replacement: 'tailored strategic correspondence' },
      { pattern: 'act now', replacement: 'timely collaborative opportunity' },
      { pattern: 'limited time', replacement: 'upcoming scheduling window' },
      // Wave 5 Anti-Buzzword Taxonomy (Gap 203)
      { pattern: 'game-changer', replacement: 'strategic advantage' },
      { pattern: 'quick 5-min chat', replacement: '15-min discovery call' },
      { pattern: 'quick chat', replacement: 'focused exploratory discussion' },
      { pattern: 'jump on a call', replacement: 'schedule an introductory meeting' },
      { pattern: 'hop on a call', replacement: 'schedule an introductory meeting' },
      { pattern: 'revolutionary paradigm', replacement: 'proven commercial methodology' },
      { pattern: 'disruptive', replacement: 'innovative & streamlined' },
      { pattern: 'disrupt', replacement: 'modernize' },
      { pattern: 'world-class', replacement: 'accredited / certified' },
      { pattern: 'rockstar', replacement: 'specialized / tier-1' },
      { pattern: 'scale fast', replacement: 'sustainable commercial expansion' },
      { pattern: 'wire transfer', replacement: 'institutional banking settlement' },
      { pattern: 'guarantee', replacement: 'projected SLA' },
    ];

    const flaggedPhrases: string[] = [];
    const suggestions: string[] = [];
    const replacementSuggestions: Record<string, string> = {};

    for (const item of PROHIBITED_SPAM_PATTERNS) {
      if (textLower.includes(item.pattern)) {
        flaggedPhrases.push(item.pattern);
        suggestions.push(`Replace "${item.pattern}" with "${item.replacement}"`);
        replacementSuggestions[item.pattern] = item.replacement;
      }
    }

    const charCount = text.length;
    const maxChars = 300;
    const isLengthValid = charCount <= maxChars && charCount >= 40;
    const isSpamFree = flaggedPhrases.length === 0;

    // Wave 5: 5-Part Structure Evaluation (Gap 201)
    const hasHook = /noticed|reviewed|regarding|expansion|in reference|following|observed/i.test(text);
    const hasSynergyOrMetric = /\d+|%|facility|capacity|distribution|supply|service|accredited|iso|pilot|pipeline|contract/i.test(text);
    const hasClearCta = /call|explore|review|schedule|meeting|m-nda|nda|discuss|advis/i.test(text);
    const componentsIdentified = (hasHook ? 1 : 0) + (hasSynergyOrMetric ? 1 : 0) + (hasClearCta ? 1 : 0) + (isLengthValid ? 2 : 0);

    // Wave 5: Real-time Quality Score Index (0 - 100%) (Gap 202)
    let qualityScore = 100;
    qualityScore -= flaggedPhrases.length * 15;
    if (charCount > maxChars) qualityScore -= 25;
    else if (charCount < 40) qualityScore -= 30;
    else if (charCount < 80) qualityScore -= 10;
    if (!hasHook) qualityScore -= 10;
    if (!hasSynergyOrMetric) qualityScore -= 10;
    if (!hasClearCta) qualityScore -= 10;
    qualityScore = Math.max(15, Math.min(100, qualityScore));

    return {
      valid: isLengthValid && isSpamFree,
      isValid: isLengthValid && isSpamFree,
      charCount,
      maxChars,
      remainingChars: Math.max(0, maxChars - charCount),
      isOverLimit: charCount > maxChars,
      exceedsLength: charCount > maxChars,
      flaggedPhrases,
      flaggedSpamWords: flaggedPhrases,
      suggestions,
      replacementSuggestions,
      qualityScore,
      structureRating: {
        hasHook,
        hasSynergyOrMetric,
        hasClearCta,
        componentsIdentified,
      },
      recommendation: isSpamFree
        ? (isLengthValid ? `Institutional concise standard met (${qualityScore}% score).` : 'Please keep note between 40 and 300 characters for optimal executive response.')
        : 'Please replace promotional/buzzword phrasing with concrete institutional metrics.',
    };
  }

  /**
   * Request a warm introduction through a mutual intermediary
   */
  async requestIntroduction(userId: string, dto: CreateIntroductionDto) {
    const targetProfile = await this.prisma.professionalProfile.findUnique({
      where: { id: dto.targetProfileId },
      include: { user: true },
    });

    if (!targetProfile) {
      throw new NotFoundException('Target professional profile not found');
    }

    if (targetProfile.userId === userId) {
      throw new BadRequestException('You cannot request an introduction to yourself');
    }

    if (dto.intermediaryUserId === userId) {
      throw new BadRequestException('You cannot be your own intermediary for an introduction');
    }

    if (targetProfile.userId === dto.intermediaryUserId) {
      throw new BadRequestException('Intermediary cannot be the target individual');
    }

    // Strict Anti-Spam Quota: Cap at 85 active introductions
    const activeIntrosCount = await this.prisma.introductionRequest.count({
      where: {
        requesterUserId: userId,
        status: {
          in: [IntroductionStatus.PENDING_INTERMEDIARY, IntroductionStatus.SENT_TO_TARGET],
        },
      },
    });

    if (activeIntrosCount >= 85) {
      throw new BadRequestException(
        'Executive Introduction Quota Exceeded (85/85): You currently have 85 pending introductions in flight. Please await target responses or withdraw stale requests before initiating new bridges.',
      );
    }

    // Restrict introductions to active, accepted connections only
    const isConnectedWithIntermediary = await this.prisma.connection.count({
      where: {
        status: ConnectionStatus.ACCEPTED,
        OR: [
          { requesterUserId: userId, recipientProfile: { userId: dto.intermediaryUserId } },
          { requesterUserId: dto.intermediaryUserId, recipientProfile: { userId } },
        ],
      },
    });

    if (isConnectedWithIntermediary === 0) {
      throw new BadRequestException(
        'You can only request warm introductions through your active, 1st-degree connections.',
      );
    }

    const intro = await this.prisma.introductionRequest.create({
      data: {
        requesterUserId: userId,
        targetProfileId: dto.targetProfileId,
        intermediaryUserId: dto.intermediaryUserId,
        businessReason: dto.businessReason,
        status: IntroductionStatus.PENDING_INTERMEDIARY,
      },
      include: {
        targetProfile: { include: { company: true } },
        intermediary: { include: { profile: true } },
        requester: { include: { profile: true } },
      },
    });

    await this.logAudit(userId, 'INTRODUCTION_REQUESTED', 'IntroductionRequest', intro.id, {
      targetProfileId: dto.targetProfileId,
      intermediaryUserId: dto.intermediaryUserId,
    });

    try {
      const requesterName = intro.requester.profile?.displayName || intro.requester.email;
      const isConnectedWithIntermediary = await this.prisma.connection.count({
        where: {
          status: ConnectionStatus.ACCEPTED,
          OR: [
            { requesterUserId: userId, recipientProfile: { userId: dto.intermediaryUserId } },
            { requesterUserId: dto.intermediaryUserId, recipientProfile: { userId } },
          ],
        },
      });

      const title =
        isConnectedWithIntermediary > 0
          ? `🤝 Introduction from your Connection: ${requesterName}`
          : '🤝 Warm Executive Introduction Request';

      const body =
        isConnectedWithIntermediary > 0
          ? `Your 1st-degree connection ${requesterName} has requested an endorsement for an introduction to ${intro.targetProfile.displayName}: "${(dto.businessReason || '').slice(0, 100)}..."`
          : `${requesterName} is requesting your endorsement for an introduction to ${intro.targetProfile.displayName}: "${(dto.businessReason || '').slice(0, 100)}..."`;

      await this.notificationsService.createNotification({
        userId: dto.intermediaryUserId,
        actorId: userId,
        actorName: requesterName,
        type: NotificationType.INTRO_REQUEST,
        title,
        body,
        actionUrl: '/app/introductions',
        metadata: {
          introId: intro.id,
          targetProfileId: dto.targetProfileId,
          isExistingConnection: isConnectedWithIntermediary > 0,
        },
      });
    } catch (e) {
      this.logger?.warn?.(`Failed to send real-time notification for introduction request: ${e}`);
    }

    return intro;
  }

  /**
   * Get introductions related to current user (as requester, intermediary, or target)
   */
  async getIntroductions(userId: string) {
    const userProfile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });

    const whereClauses: any[] = [
      { requesterUserId: userId },
      { intermediaryUserId: userId },
    ];

    if (userProfile) {
      whereClauses.push({ targetProfileId: userProfile.id });
    }

    const introductions = await this.prisma.introductionRequest.findMany({
      where: { OR: whereClauses },
      include: {
        requester: { include: { profile: true } },
        intermediary: { include: { profile: true } },
        targetProfile: { include: { company: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return introductions;
  }

  /**
   * Respond to an introduction (intermediary or target)
   */
  /**
   * Respond to an introduction (intermediary or target)
   */
  async respondIntroduction(
    userId: string,
    introId: string,
    action: IntroductionAction,
    endorsementNote?: string,
  ) {
    const intro = await this.prisma.introductionRequest.findUnique({
      where: { id: introId },
      include: {
        targetProfile: true,
        intermediary: { include: { profile: true } },
        requester: { include: { profile: true } },
      },
    });

    if (!intro) {
      throw new NotFoundException('Introduction request not found');
    }

    let nextStatus: IntroductionStatus;
    let updatedReason = intro.businessReason;

    if (
      action === IntroductionAction.INTERMEDIARY_ACCEPT ||
      action === IntroductionAction.INTERMEDIARY_REJECT
    ) {
      if (intro.intermediaryUserId !== userId) {
        throw new ForbiddenException('Only the designated intermediary can perform this action');
      }
      if (intro.status !== IntroductionStatus.PENDING_INTERMEDIARY) {
        throw new BadRequestException(`Cannot review introduction in status ${intro.status}`);
      }
      nextStatus =
        action === IntroductionAction.INTERMEDIARY_ACCEPT
          ? IntroductionStatus.SENT_TO_TARGET
          : IntroductionStatus.REJECTED_BY_INTERMEDIARY;

      if (action === IntroductionAction.INTERMEDIARY_ACCEPT) {
        const intermediaryName = intro.intermediary.profile?.displayName || intro.intermediary.email;
        if (endorsementNote && endorsementNote.trim()) {
          updatedReason = `[Attested Endorsement from ${intermediaryName}: "${endorsementNote.trim()}"] ${intro.businessReason}`;
        }

        // Notify target executive of endorsed warm introduction via SSE
        if (intro.targetProfile.userId) {
          try {
            const isIntermediaryConnected = await this.prisma.connection.count({
              where: {
                status: ConnectionStatus.ACCEPTED,
                OR: [
                  { requesterUserId: userId, recipientProfile: { userId: intro.targetProfile.userId } },
                  { requesterUserId: intro.targetProfile.userId, recipientProfile: { userId } },
                ],
              },
            });

            const targetTitle =
              isIntermediaryConnected > 0
                ? `🤝 Introduction from your Connection: ${intermediaryName}`
                : '🤝 Warm Executive Introduction Received';

            const targetBody =
              isIntermediaryConnected > 0
                ? `Your 1st-degree connection ${intermediaryName} has attested and introduced ${intro.requester.profile?.displayName || 'a partner'}: "${(endorsementNote || intro.businessReason).slice(0, 100)}..."`
                : `${intermediaryName} has attested and introduced ${intro.requester.profile?.displayName || 'a partner'}: "${(endorsementNote || intro.businessReason).slice(0, 100)}..."`;

            await this.notificationsService.createNotification({
              userId: intro.targetProfile.userId,
              actorId: userId,
              actorName: intermediaryName,
              type: NotificationType.INTRO_REQUEST,
              title: targetTitle,
              body: targetBody,
              actionUrl: '/app/introductions',
              metadata: {
                introId: intro.id,
                intermediaryId: userId,
                endorsementNote,
                isExistingConnection: isIntermediaryConnected > 0,
              },
            });
          } catch {}
        }
      }
    } else {
      // TARGET_ACCEPT or TARGET_DECLINE
      if (intro.targetProfile.userId !== userId) {
        throw new ForbiddenException('Only the target professional can respond to this introduction');
      }
      if (intro.status !== IntroductionStatus.SENT_TO_TARGET) {
        throw new BadRequestException('Introduction is not currently awaiting target response');
      }
      nextStatus =
        action === IntroductionAction.TARGET_ACCEPT
          ? IntroductionStatus.ACCEPTED_BY_TARGET
          : IntroductionStatus.DECLINED_BY_TARGET;

      // If accepted by target, automatically create mutual ACCEPTED connection!
      if (nextStatus === IntroductionStatus.ACCEPTED_BY_TARGET) {
        const intermediaryName = intro.intermediary.profile?.displayName || intro.intermediary.email;
        await this.prisma.connection.upsert({
          where: {
            requesterUserId_recipientProfileId: {
              requesterUserId: intro.requesterUserId,
              recipientProfileId: intro.targetProfileId,
            },
          },
          update: {
            status: ConnectionStatus.ACCEPTED,
            respondedAt: new Date(),
          },
          create: {
            requesterUserId: intro.requesterUserId,
            recipientProfileId: intro.targetProfileId,
            businessReason: `Warm intro via ${intermediaryName}: ${intro.businessReason}`,
            status: ConnectionStatus.ACCEPTED,
            respondedAt: new Date(),
          },
        });

        // Notify both requester and intermediary via real-time SSE
        try {
          await this.notificationsService.createNotification({
            userId: intro.requesterUserId,
            actorId: userId,
            actorName: intro.targetProfile.displayName,
            type: NotificationType.INTRO_ACCEPTED,
            title: '🎉 Warm Introduction Accepted',
            body: `${intro.targetProfile.displayName} accepted your warm introduction facilitated by ${intermediaryName}. Direct commercial channel opened!`,
            actionUrl: '/app/connections',
            metadata: { introId: intro.id },
          });

          await this.notificationsService.createNotification({
            userId: intro.intermediaryUserId,
            actorId: userId,
            actorName: intro.targetProfile.displayName,
            type: NotificationType.INTRO_ACCEPTED,
            title: '🤝 Introduction Completed Successfully',
            body: `Your facilitated introduction between ${intro.requester.profile?.displayName || 'Requester'} and ${intro.targetProfile.displayName} was accepted!`,
            actionUrl: '/app/introductions',
            metadata: { introId: intro.id },
          });
        } catch {}
      }
    }

    const updated = await this.prisma.introductionRequest.update({
      where: { id: introId },
      data: {
        status: nextStatus,
        businessReason: updatedReason,
      },
      include: {
        targetProfile: { include: { company: true } },
        intermediary: true,
        requester: { include: { profile: true } },
      },
    });

    await this.logAudit(userId, `INTRODUCTION_${nextStatus}`, 'IntroductionRequest', introId, {
      previousStatus: intro.status,
      newStatus: nextStatus,
      endorsementNote,
    });

    return updated;
  }

  private async logAudit(
    userId: string | null,
    action: string,
    resource: string,
    resourceId: string,
    metadata: Record<string, any>,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          metadata: JSON.stringify(metadata),
        },
      });
    } catch {
      // Non-fatal if audit log fails
    }
  }
}
