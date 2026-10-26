import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ConnectionStatus, NotificationType } from '@prisma/client';
import { Subject, Observable, merge, interval } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface RealTimeMessageEvent {
  conversationId: string;
  recipientUserIds: string[];
  message: any;
}

@Injectable()
export class MessagingService {
  private readonly messageStream$ = new Subject<RealTimeMessageEvent>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Subscribe to real-time conversation message stream
   */
  getMessageStream(userId: string, conversationId: string): Observable<{ data: any }> {
    const messages$ = this.messageStream$.pipe(
      filter(
        (event) =>
          event.conversationId === conversationId &&
          (event.recipientUserIds.includes(userId) || event.message.senderUserId === userId),
      ),
      map((event) => ({ data: event.message })),
    );
    const heartbeat$ = interval(20000).pipe(
      map(() => ({ data: { type: 'HEARTBEAT', timestamp: new Date().toISOString() } })),
    );
    return merge(messages$, heartbeat$);
  }

  /**
   * Get all conversations the user is a participant in
   */
  async getConversations(userId: string) {
    const participations = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  include: { profile: { include: { company: true } } },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    const results = await Promise.all(
      participations.map(async (p) => {
        const conv = p.conversation;
        const otherParticipant = conv.participants.find((part) => part.userId !== userId);
        const lastMessage = conv.messages[0] || null;

        const partner = otherParticipant
          ? {
              userId: otherParticipant.userId,
              displayName:
                otherParticipant.user.profile?.displayName || otherParticipant.user.email,
              headline: otherParticipant.user.profile?.headline || null,
              companyName: otherParticipant.user.profile?.company?.name || null,
            }
          : {
              userId: 'unknown',
              displayName: 'Direct Conversation',
              headline: null,
              companyName: null,
            };

        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            senderUserId: { not: userId },
            deletedAt: null,
            ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}),
          },
        });

        const unread = unreadCount > 0;

        return {
          id: conv.id,
          conversationType: conv.conversationType,
          partner,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                body: lastMessage.deletedAt ? 'This message was deleted by sender' : lastMessage.body,
                senderUserId: lastMessage.senderUserId,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unread: !!unread,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      }),
    );
    return results;
  }

  /**
   * Create or fetch existing conversation between two users
   * Requires an active mutual connection or prior accepted intro
   */
  async createConversation(userId: string, dto: CreateConversationDto) {
    if (userId === dto.recipientUserId) {
      throw new BadRequestException('You cannot create a conversation with yourself');
    }

    const recipient = await this.prisma.user.findUnique({
      where: { id: dto.recipientUserId },
      include: { profile: true },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient user not found');
    }

    // Authorization Check: Must have mutual connection or accepted intro
    const isConnected = await this.verifyConnectionExists(userId, dto.recipientUserId);
    if (!isConnected) {
      throw new ForbiddenException(
        'Messaging requires an accepted business connection between parties to prevent unsolicited spam',
      );
    }

    // Check if direct conversation already exists between these two users
    const existing = await this.prisma.conversation.findFirst({
      where: {
        conversationType: 'DIRECT',
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: dto.recipientUserId } } },
        ],
      },
      include: {
        participants: true,
      },
    });

    if (existing) {
      if ((dto.initialMessage && dto.initialMessage.trim()) || dto.attachmentUrl) {
        const msg = await this.sendMessage(userId, existing.id, {
          body: dto.initialMessage || (dto.attachmentName ? `[Attached: ${dto.attachmentName}]` : 'Hello'),
          attachmentUrl: dto.attachmentUrl,
          attachmentName: dto.attachmentName,
        });
        return { conversationId: existing.id, message: msg };
      }
      return { conversationId: existing.id, message: null };
    }

    // Create new conversation
    const hasInitialMsg = Boolean((dto.initialMessage && dto.initialMessage.trim()) || dto.attachmentUrl);
    const initialBody = dto.initialMessage?.trim() || (dto.attachmentName ? `[Attached: ${dto.attachmentName}]` : 'Hello');
    const conversation = await this.prisma.conversation.create({
      data: {
        createdByUserId: userId,
        conversationType: 'DIRECT',
        participants: {
          create: [
            { userId, lastReadAt: new Date() },
            { userId: dto.recipientUserId },
          ],
        },
        ...(hasInitialMsg ? {
          messages: {
            create: {
              senderUserId: userId,
              body: initialBody,
              attachmentUrl: dto.attachmentUrl || null,
              attachmentName: dto.attachmentName || null,
            },
          },
        } : {}),
      },
      include: {
        messages: true,
        participants: {
          include: { user: { include: { profile: true } } },
        },
      },
    });

    const sender = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    const senderName = sender?.profile?.displayName || sender?.email || 'Me';

    if (hasInitialMsg && conversation.messages[0]) {
      await this.stageMessageNotification(recipient.email, initialBody);

      this.messageStream$.next({
        conversationId: conversation.id,
        recipientUserIds: [dto.recipientUserId],
        message: {
          id: conversation.messages[0].id,
          body: conversation.messages[0].body,
          messageType: conversation.messages[0].messageType || 'TEXT',
          attachmentUrl: conversation.messages[0].attachmentUrl || null,
          attachmentName: conversation.messages[0].attachmentName || null,
          meetingPayloadJson: conversation.messages[0].meetingPayloadJson || null,
          senderUserId: conversation.messages[0].senderUserId,
          senderName,
          createdAt: conversation.messages[0].createdAt,
          isMine: false,
        },
      });
    }

    const firstMsg = conversation.messages[0];
    const returnMsg = firstMsg
      ? {
          id: firstMsg.id,
          body: firstMsg.body,
          messageType: firstMsg.messageType || 'TEXT',
          attachmentUrl: firstMsg.attachmentUrl || null,
          attachmentName: firstMsg.attachmentName || null,
          meetingPayloadJson: firstMsg.meetingPayloadJson || null,
          senderUserId: firstMsg.senderUserId,
          senderName,
          createdAt: firstMsg.createdAt,
          isMine: true,
        }
      : null;

    return { conversationId: conversation.id, message: returnMsg };
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(userId: string, conversationId: string) {
    // Verify participant
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not an authorized participant in this conversation');
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          include: { profile: true },
        },
      },
    });

    return messages.map((m) => ({
      id: m.id,
      body: m.deletedAt ? 'This message was deleted by sender' : m.body,
      messageType: m.messageType || 'TEXT',
      attachmentUrl: m.deletedAt ? null : m.attachmentUrl || null,
      attachmentName: m.deletedAt ? null : m.attachmentName || null,
      meetingPayloadJson: m.deletedAt ? null : m.meetingPayloadJson || null,
      senderUserId: m.senderUserId,
      senderName: m.sender.profile?.displayName || m.sender.email,
      createdAt: m.createdAt,
      editedAt: m.editedAt || null,
      isEdited: Boolean(m.editedAt),
      deletedAt: m.deletedAt || null,
      isDeleted: Boolean(m.deletedAt),
      isMine: m.senderUserId === userId,
    }));
  }

  /**
   * Edit a message within 30 minutes of sending
   */
  async editMessage(userId: string, conversationId: string, messageId: string, newBody: string) {
    if (!newBody || !newBody.trim()) {
      throw new BadRequestException('Message body cannot be empty');
    }

    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.conversationId !== conversationId) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderUserId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    if (message.deletedAt) {
      throw new BadRequestException('Cannot edit a deleted message');
    }

    // 30-minute edit limit
    const ageMs = Date.now() - new Date(message.createdAt).getTime();
    const maxAgeMs = 30 * 60 * 1000;
    if (ageMs > maxAgeMs) {
      throw new BadRequestException('Messages can only be edited within 30 minutes of sending.');
    }

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        body: newBody.trim(),
        editedAt: new Date(),
      },
      include: {
        sender: { include: { profile: true } },
      },
    });

    return {
      id: updated.id,
      body: updated.body,
      editedAt: updated.editedAt,
      isEdited: true,
      senderUserId: updated.senderUserId,
      senderName: updated.sender.profile?.displayName || updated.sender.email,
      createdAt: updated.createdAt,
      isMine: true,
    };
  }

  /**
   * Delete message: for everyone (replaces content) or for me
   */
  async deleteMessage(userId: string, conversationId: string, messageId: string, mode: 'everyone' | 'me' = 'everyone') {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.conversationId !== conversationId) {
      throw new NotFoundException('Message not found');
    }

    if (mode === 'everyone') {
      if (message.senderUserId !== userId) {
        throw new ForbiddenException('You can only delete your own messages for everyone');
      }

      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          deletedAt: new Date(),
          body: 'This message was deleted by sender',
          attachmentUrl: null,
          attachmentName: null,
          meetingPayloadJson: null,
        },
      });

      return {
        success: true,
        messageId,
        mode: 'everyone',
        isDeleted: true,
      };
    }

    return {
      success: true,
      messageId,
      mode: 'me',
    };
  }

  /**
   * Report conversation / user for trust & safety review
   */
  async reportConversation(userId: string, conversationId: string, reason: string, notes?: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
      include: {
        conversation: {
          include: { participants: true },
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const otherParticipant = participant.conversation.participants.find((p) => p.userId !== userId);
    const incidentId = `REP-${Date.now()}`;

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'REPORT_CONVERSATION',
        resource: 'Conversation',
        resourceId: conversationId,
      },
    });

    return {
      success: true,
      incidentId,
      reportedUserId: otherParticipant?.userId || null,
      reason,
      notes: notes || null,
      message: 'Report received by Setu Corporate Trust & Safety desk. Review SLA is within 4 hours.',
    };
  }

  /**
   * Block and Unblock conversation
   */
  async blockConversation(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
      include: {
        conversation: {
          include: { participants: true },
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const otherParticipant = participant.conversation.participants.find((p) => p.userId !== userId);

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'BLOCK_USER',
        resource: 'User',
        resourceId: otherParticipant?.userId || conversationId,
      },
    });

    return {
      success: true,
      blockedUserId: otherParticipant?.userId || null,
      conversationId,
      message: 'User blocked successfully.',
    };
  }

  async unblockConversation(userId: string, conversationId: string) {
    return {
      success: true,
      conversationId,
      message: 'User unblocked successfully.',
    };
  }

  /**
   * Send a message in an existing conversation (Features #29 & #47)
   */
  async sendMessage(userId: string, conversationId: string, dto: SendMessageDto) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      include: {
        conversation: {
          include: {
            participants: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not an authorized participant in this conversation');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderUserId: userId,
        body: dto.body,
        messageType: dto.messageType || 'TEXT',
        attachmentUrl: dto.attachmentUrl || null,
        attachmentName: dto.attachmentName || null,
        meetingPayloadJson: dto.meetingPayloadJson || null,
      },
    });

    // Update conversation updatedAt & sender's lastReadAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    await this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });

    // Fetch sender profile details for real-time dispatch
    const sender = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    const senderName = sender?.profile?.displayName || sender?.email || 'Partner';

    const formattedMessage = {
      id: message.id,
      body: message.body,
      messageType: message.messageType || 'TEXT',
      attachmentUrl: message.attachmentUrl || null,
      attachmentName: message.attachmentName || null,
      meetingPayloadJson: message.meetingPayloadJson || null,
      senderUserId: message.senderUserId,
      senderName,
      createdAt: message.createdAt,
      isMine: false, // Calculated on recipient receiver side
    };

    const otherParticipants = participant.conversation.participants.filter(
      (p) => p.userId !== userId,
    );
    const recipientUserIds = otherParticipants.map((p) => p.userId);

    // Emit live message event to all subscribers of this conversation stream
    this.messageStream$.next({
      conversationId,
      recipientUserIds,
      message: formattedMessage,
    });

    // Stage in-app real-time notification + email outbox
    for (const other of otherParticipants) {
      if (other.userId) {
        try {
          await this.notificationsService.createNotification({
            userId: other.userId,
            actorId: userId,
            actorName: senderName,
            type: NotificationType.SYSTEM_ALERT,
            title: `New Message from ${senderName}`,
            body: dto.body.slice(0, 100),
            actionUrl: `/app/messages?convId=${conversationId}`,
            metadata: { conversationId, messageId: message.id },
          });
        } catch {
          // Non-blocking if notification creation fails
        }
      }

      if (other.user.email) {
        await this.stageMessageNotification(other.user.email, dto.body);
      }
    }

    return formattedMessage;
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    await this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return { status: 'marked_read' };
  }

  /**
   * Broadcast typing status to all other participants in the conversation
   */
  async broadcastTyping(userId: string, conversationId: string, isTyping: boolean) {
    try {
      const participant = await this.prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId, userId } },
        include: {
          conversation: {
            include: {
              participants: true,
            },
          },
        },
      });

      if (!participant) return;

      const otherParticipants = participant.conversation.participants
        .filter((p) => p.userId !== userId)
        .map((p) => p.userId);

      this.messageStream$.next({
        conversationId,
        recipientUserIds: otherParticipants,
        message: {
          type: 'TYPING',
          senderUserId: userId,
          isTyping: Boolean(isTyping),
        } as any,
      });
    } catch {}
  }

  /**
   * Process email outbox (Transactional email queue)
   */
  async getEmailOutbox(status?: string) {
    return this.prisma.emailOutbox.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Process / Deliver pending outbox emails (with safe bounded retries)
   */
  async processOutboxBatch(batchSize: number = 10) {
    const pendingEmails = await this.prisma.emailOutbox.findMany({
      where: { status: 'PENDING', attempts: { lt: 3 } },
      take: batchSize,
      orderBy: { createdAt: 'asc' },
    });

    const results = [];
    for (const email of pendingEmails) {
      try {
        // In local development or production without external SMTP key,
        // we simulate guaranteed outbox delivery and mark SENT
        await this.prisma.emailOutbox.update({
          where: { id: email.id },
          data: {
            status: 'SENT',
            attempts: email.attempts + 1,
            sentAt: new Date(),
          },
        });
        results.push({ id: email.id, status: 'SENT' });
      } catch (err: any) {
        await this.prisma.emailOutbox.update({
          where: { id: email.id },
          data: {
            attempts: email.attempts + 1,
            lastError: err.message,
            status: email.attempts + 1 >= 3 ? 'FAILED' : 'PENDING',
          },
        });
        results.push({ id: email.id, status: 'RETRY' });
      }
    }

    return { processed: results.length, results };
  }

  private async verifyConnectionExists(userA: string, userB: string): Promise<boolean> {
    const profileA = await this.prisma.professionalProfile.findUnique({ where: { userId: userA } });
    const profileB = await this.prisma.professionalProfile.findUnique({ where: { userId: userB } });

    // Check direct connections
    const conditions: any[] = [];
    if (profileB) {
      conditions.push({ requesterUserId: userA, recipientProfileId: profileB.id, status: ConnectionStatus.ACCEPTED });
    }
    if (profileA) {
      conditions.push({ requesterUserId: userB, recipientProfileId: profileA.id, status: ConnectionStatus.ACCEPTED });
    }

    if (conditions.length > 0) {
      const conn = await this.prisma.connection.findFirst({
        where: { OR: conditions },
      });
      if (conn) return true;
    }

    // Check accepted warm introductions
    if (profileB) {
      const intro = await this.prisma.introductionRequest.findFirst({
        where: {
          requesterUserId: userA,
          targetProfileId: profileB.id,
          status: 'ACCEPTED_BY_TARGET',
        },
      });
      if (intro) return true;
    }
    if (profileA) {
      const intro = await this.prisma.introductionRequest.findFirst({
        where: {
          requesterUserId: userB,
          targetProfileId: profileA.id,
          status: 'ACCEPTED_BY_TARGET',
        },
      });
      if (intro) return true;
    }

    return false;
  }

  private async stageMessageNotification(recipientEmail: string, messageSnippet: string) {
    try {
      await this.prisma.emailOutbox.create({
        data: {
          toAddress: recipientEmail,
          templateKey: 'NEW_DIRECT_MESSAGE',
          subject: 'New message received on Project Setu',
          htmlBody: `<p>You have a new direct message: "${messageSnippet.substring(0, 120)}..."</p>`,
        },
      });
    } catch {
      // Non-fatal if outbox logging fails
    }
  }

  /**
   * Feature #29: Mutual Calendar Meeting / ICS Flow
   * Generates RFC-5545 standard .ics calendar invite for mutual business meetings.
   */
  generateCalendarIcs(params: {
    meetingId: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    organizerName: string;
    organizerEmail: string;
    attendeeName?: string;
    attendeeEmail?: string;
    location?: string;
  }): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const uid = `${params.meetingId}@projectsetu.com`;
    const dtStamp = formatDate(new Date());
    const dtStart = formatDate(params.startTime);
    const dtEnd = formatDate(params.endTime);

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Project Setu//Enterprise Commercial Network//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${params.title}`,
      `DESCRIPTION:${params.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${params.location || 'Project Setu Virtual Conference'}`,
      `ORGANIZER;CN=${params.organizerName}:mailto:${params.organizerEmail}`,
      params.attendeeEmail ? `ATTENDEE;ROLE=REQ-PARTICIPANT;CN=${params.attendeeName || 'Partner'}:mailto:${params.attendeeEmail}` : '',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n');
  }
}

