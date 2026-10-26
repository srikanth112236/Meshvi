import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionsService, parseConnectionMeta } from './connections.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConnectionStatus, IntroductionStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { IntroductionAction } from './dto/respond-introduction.dto';

describe('ConnectionsService', () => {
  let service: ConnectionsService;
  let prisma: any;
  let notificationsService: any;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    connection: {
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    introductionRequest: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    conversation: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    dealRoom: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    notification: {
      create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    },
  };

  const mockNotificationsService = {
    createNotification: jest.fn().mockResolvedValue({ id: 'notif-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<ConnectionsService>(ConnectionsService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseConnectionMeta', () => {
    it('should parse valid JSON metadata string', () => {
      const meta = parseConnectionMeta('{"reminderCount":1,"clarificationQuestion":"timeline?"}');
      expect(meta.reminderCount).toBe(1);
      expect(meta.clarificationQuestion).toBe('timeline?');
    });

    it('should return empty object on empty or invalid string', () => {
      expect(parseConnectionMeta('')).toEqual({});
      expect(parseConnectionMeta('invalid string')).toEqual({});
      expect(parseConnectionMeta(null)).toEqual({});
    });
  });

  describe('getConnectionQuota', () => {
    it('should calculate verified user quota (limit 10)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        workEmailVerified: true,
        memberships: [],
      });
      mockPrisma.connection.count.mockResolvedValue(3);

      const quota = await service.getConnectionQuota('user-1');
      expect(quota.limit).toBe(10);
      expect(quota.used).toBe(3);
      expect(quota.remaining).toBe(7);
    });

    it('should calculate unverified user quota (limit 3)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-unverified',
        workEmailVerified: false,
        profile: { isWorkEmailVerified: false, isLinkedInVerified: false },
        memberships: [],
      });
      mockPrisma.connection.count.mockResolvedValue(1);

      const quota = await service.getConnectionQuota('user-unverified');
      expect(quota.limit).toBe(3);
      expect(quota.used).toBe(1);
      expect(quota.remaining).toBe(2);
    });
  });

  describe('clarifyConnection', () => {
    it('should allow recipient to ask clarification question and transition status', async () => {
      const mockConn = {
        id: 'conn-1',
        recipientUserId: 'target-user',
        requesterUserId: 'req-user',
        status: ConnectionStatus.PENDING,
        businessReason: 'Initial business reason',
        recipientProfile: {
          id: 'prof-target',
          userId: 'target-user',
          displayName: 'Marcus Sterling',
          user: { id: 'target-user' },
        },
        requester: {
          id: 'req-user',
          email: 'req@setu.local',
          profile: { displayName: 'Priya Sharma' },
        },
      };
      mockPrisma.connection.findUnique.mockResolvedValue(mockConn);
      mockPrisma.connection.update.mockResolvedValue({
        ...mockConn,
        status: 'CLARIFICATION_REQUESTED' as any,
      });

      const res = await service.clarifyConnection(
        'target-user',
        'conn-1',
        'Could you specify the project budget range?',
      );

      expect(mockPrisma.connection.update).toHaveBeenCalled();
      expect(mockPrisma.notification.create).toHaveBeenCalled();
      expect(res.success).toBe(true);
      expect(res.connection.status).toBe('CLARIFICATION_REQUESTED');
    });

    it('should reject clarification from non-recipient', async () => {
      mockPrisma.connection.findUnique.mockResolvedValue({
        id: 'conn-1',
        recipientUserId: 'target-user',
        requesterUserId: 'req-user',
        status: ConnectionStatus.PENDING,
        recipientProfile: {
          id: 'prof-target',
          userId: 'target-user',
        },
      });

      await expect(
        service.clarifyConnection('intruder-user', 'conn-1', 'Why?'),
      ).rejects.toThrow();
    });
  });

  describe('answerClarification', () => {
    it('should allow requester to reply to clarification', async () => {
      const mockConn = {
        id: 'conn-1',
        requesterUserId: 'req-user',
        recipientUserId: 'target-user',
        status: 'CLARIFICATION_REQUESTED' as any,
        businessReason: 'Initial reason',
        recipientProfile: {
          id: 'prof-target',
          userId: 'target-user',
          displayName: 'Marcus Sterling',
          user: { id: 'target-user' },
        },
        requester: {
          id: 'req-user',
          email: 'req@setu.local',
          profile: { displayName: 'Priya Sharma' },
        },
      };
      mockPrisma.connection.findUnique.mockResolvedValue(mockConn);
      mockPrisma.connection.update.mockResolvedValue({
        ...mockConn,
        status: 'CLARIFICATION_RESPONDED' as any,
      });

      const res = await service.answerClarification(
        'req-user',
        'conn-1',
        'Budget is earmarked between $50k and $100k for phase 1.',
      );

      expect(mockPrisma.connection.update).toHaveBeenCalled();
      expect(mockPrisma.notification.create).toHaveBeenCalled();
      expect(res.success).toBe(true);
      expect(res.connection.status).toBe('CLARIFICATION_RESPONDED');
    });
  });

  describe('withdrawConnection', () => {
    it('should restore quota if withdrawn within 24 hours', async () => {
      const recentDate = new Date(Date.now() - 3600000); // 1 hour ago
      const mockConn = {
        id: 'conn-1',
        requesterUserId: 'req-user',
        createdAt: recentDate,
        status: ConnectionStatus.PENDING,
      };
      mockPrisma.connection.findUnique.mockResolvedValue(mockConn);
      mockPrisma.connection.update.mockResolvedValue({
        ...mockConn,
        status: ConnectionStatus.WITHDRAWN,
      });

      const res = await service.withdrawConnection('req-user', 'conn-1');
      expect(res.connection.status).toBe(ConnectionStatus.WITHDRAWN);
      expect(res.quotaRestored).toBe(true);
    });
  });

  describe('remindConnection', () => {
    it('should enforce 1-reminder anti-spam limit', async () => {
      const mockConn = {
        id: 'conn-1',
        requesterUserId: 'req-user',
        status: ConnectionStatus.PENDING,
        businessReason: 'Reason',
        declineNote: JSON.stringify({ reminderCount: 1 }),
        recipientProfile: {
          id: 'prof-target',
          userId: 'target-user',
          displayName: 'Marcus Sterling',
          user: { id: 'target-user' },
        },
        requester: {
          id: 'req-user',
          email: 'req@setu.local',
          profile: { displayName: 'Priya Sharma' },
        },
      };
      mockPrisma.connection.findUnique.mockResolvedValue(mockConn);

      await expect(
        service.remindConnection('req-user', 'conn-1', 'Nudge again'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('respondIntroduction', () => {
    it('should allow intermediary to endorse and forward intro to target', async () => {
      const mockIntro = {
        id: 'intro-1',
        intermediaryUserId: 'inter-user',
        intermediary: { profile: { displayName: 'Mei Ling' } },
        requesterUserId: 'req-user',
        requester: { profile: { displayName: 'Priya Sharma' } },
        targetProfileId: 'prof-target',
        targetProfile: { userId: 'target-user', displayName: 'Marcus Sterling' },
        status: IntroductionStatus.PENDING_INTERMEDIARY,
        businessReason: 'Commercial expansion',
      };

      mockPrisma.introductionRequest.findUnique.mockResolvedValue(mockIntro);
      mockPrisma.introductionRequest.update.mockResolvedValue({
        ...mockIntro,
        status: IntroductionStatus.SENT_TO_TARGET,
      });

      const res = await service.respondIntroduction(
        'inter-user',
        'intro-1',
        IntroductionAction.INTERMEDIARY_ACCEPT,
        'Highly recommended business partner.',
      );

      expect(mockPrisma.introductionRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'intro-1' },
          data: expect.objectContaining({
            status: IntroductionStatus.SENT_TO_TARGET,
          }),
        }),
      );
      expect(res.status).toBe(IntroductionStatus.SENT_TO_TARGET);
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    });

    it('should allow target to accept introduction and auto-create accepted connection', async () => {
      const mockIntro = {
        id: 'intro-1',
        intermediaryUserId: 'inter-user',
        intermediary: { profile: { displayName: 'Mei Ling' } },
        requesterUserId: 'req-user',
        requester: { profile: { displayName: 'Priya Sharma' } },
        targetProfileId: 'prof-target',
        targetProfile: { userId: 'target-user', displayName: 'Marcus Sterling' },
        status: IntroductionStatus.SENT_TO_TARGET,
        businessReason: 'Commercial expansion',
      };

      mockPrisma.introductionRequest.findUnique.mockResolvedValue(mockIntro);
      mockPrisma.connection.upsert.mockResolvedValue({ id: 'conn-auto-1', status: ConnectionStatus.ACCEPTED });
      mockPrisma.introductionRequest.update.mockResolvedValue({
        ...mockIntro,
        status: IntroductionStatus.ACCEPTED_BY_TARGET,
      });

      const res = await service.respondIntroduction(
        'target-user',
        'intro-1',
        IntroductionAction.TARGET_ACCEPT,
      );

      expect(mockPrisma.connection.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            requesterUserId: 'req-user',
            recipientProfileId: 'prof-target',
            status: ConnectionStatus.ACCEPTED,
          }),
        }),
      );
      expect(res.status).toBe(IntroductionStatus.ACCEPTED_BY_TARGET);
      expect(mockNotificationsService.createNotification).toHaveBeenCalledTimes(2);
    });
  });
});
