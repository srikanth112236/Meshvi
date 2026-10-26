import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { ConnectionResponseAction } from './dto/respond-connection.dto';
import { IntroductionAction } from './dto/respond-introduction.dto';
import { IntroductionStatus } from '@prisma/client';

describe('ConnectionsController', () => {
  let controller: ConnectionsController;
  let service: ConnectionsService;

  const mockConnectionsService = {
    requestConnection: jest.fn(),
    getActiveConnections: jest.fn(),
    getConnectionRequests: jest.fn(),
    getConnectionQuota: jest.fn(),
    respondConnection: jest.fn(),
    cancelConnection: jest.fn(),
    withdrawConnection: jest.fn(),
    remindConnection: jest.fn(),
    clarifyConnection: jest.fn(),
    answerClarification: jest.fn(),
    delegateConnection: jest.fn(),
    scheduleFollowUp: jest.fn(),
    requestIntroduction: jest.fn(),
    getIntroductions: jest.fn(),
    respondIntroduction: jest.fn(),
    generateSmartDrafts: jest.fn(),
    lintNote: jest.fn(),
    getColleaguesForHandover: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@vedasynk.local',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionsController],
      providers: [
        {
          provide: ConnectionsService,
          useValue: mockConnectionsService,
        },
      ],
    }).compile();

    controller = module.get<ConnectionsController>(ConnectionsController);
    service = module.get<ConnectionsService>(ConnectionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should request a connection with voice memo and agenda contract', async () => {
    const dto = {
      recipientProfileId: 'prof-456',
      businessReason: 'Exploring partnership in beverage distribution for airport lounges',
      voiceMemoUrl: 'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQ8=',
      voiceMemoDurationSec: 28,
      agendaDeliverables: [
        'Align on commercial SLA & pricing schedule',
        'Review regional distribution rights',
      ],
    };
    mockConnectionsService.requestConnection.mockResolvedValue({ id: 'conn-1', ...dto } as any);

    const result: any = await controller.requestConnection(mockUser, dto);
    expect(result).toHaveProperty('id', 'conn-1');
    expect(result.voiceMemoDurationSec).toBe(28);
    expect(mockConnectionsService.requestConnection).toHaveBeenCalledWith(mockUser.id, dto);
  });

  it('should list active connections and quota', async () => {
    mockConnectionsService.getActiveConnections.mockResolvedValue([]);
    mockConnectionsService.getConnectionQuota.mockResolvedValue({ limit: 10, used: 2, remaining: 8 });

    const result = await controller.getActiveConnections(mockUser);
    expect(Array.isArray(result)).toBe(true);
    expect(mockConnectionsService.getActiveConnections).toHaveBeenCalledWith(mockUser.id);

    const quota = await controller.getConnectionQuota(mockUser);
    expect(quota.remaining).toBe(8);
  });

  it('should accept a connection request', async () => {
    mockConnectionsService.respondConnection.mockResolvedValue({ id: 'conn-1', status: 'ACCEPTED' } as any);
    const result = await controller.acceptConnection(mockUser, 'conn-1');
    expect(result).toHaveProperty('status', 'ACCEPTED');
    expect(mockConnectionsService.respondConnection).toHaveBeenCalledWith(
      mockUser.id,
      'conn-1',
      ConnectionResponseAction.ACCEPT,
    );
  });

  it('should decline a connection request with optional reason taxonomy', async () => {
    mockConnectionsService.respondConnection.mockResolvedValue({ id: 'conn-1', status: 'DECLINED' } as any);
    const result = await controller.declineConnection(mockUser, 'conn-1', 'NOT_A_FIT', 'Out of market scope');
    expect(result).toHaveProperty('status', 'DECLINED');
    expect(mockConnectionsService.respondConnection).toHaveBeenCalledWith(
      mockUser.id,
      'conn-1',
      ConnectionResponseAction.DECLINE,
      'NOT_A_FIT',
      'Out of market scope',
    );
  });

  it('should request clarification on an incoming connection bridge', async () => {
    mockConnectionsService.clarifyConnection.mockResolvedValue({
      success: true,
      message: 'Clarification sent',
      connection: { id: 'conn-1', status: 'CLARIFICATION_REQUESTED' },
    } as any);

    const result = await controller.clarifyConnection(mockUser, 'conn-1', {
      question: 'What is your timeline for rollout?',
    });

    expect(result.success).toBe(true);
    expect(mockConnectionsService.clarifyConnection).toHaveBeenCalledWith(
      mockUser.id,
      'conn-1',
      'What is your timeline for rollout?',
    );
  });

  it('should answer clarification on an outgoing connection bridge', async () => {
    mockConnectionsService.answerClarification.mockResolvedValue({
      success: true,
      message: 'Answer sent',
      connection: { id: 'conn-1', status: 'CLARIFICATION_RESPONDED' },
    } as any);

    const result = await controller.answerClarification(mockUser, 'conn-1', {
      answer: 'Rollout planned for Q4 2026.',
    });

    expect(result.success).toBe(true);
    expect(mockConnectionsService.answerClarification).toHaveBeenCalledWith(
      mockUser.id,
      'conn-1',
      'Rollout planned for Q4 2026.',
    );
  });

  it('should delegate connection to a colleague', async () => {
    mockConnectionsService.delegateConnection.mockResolvedValue({
      id: 'conn-1',
      status: 'DELEGATED',
      delegatedToProfileId: 'colleague-prof-99',
    } as any);

    const result: any = await controller.delegateConnection(mockUser, 'conn-1', 'colleague-prof-99', undefined, 'Handles SEA partnerships');
    expect(result.status).toBe('DELEGATED');
    expect(mockConnectionsService.delegateConnection).toHaveBeenCalledWith(
      mockUser.id,
      'conn-1',
      'colleague-prof-99',
      'Handles SEA partnerships',
    );
  });

  it('should schedule smart follow-up reminder', async () => {
    const futureDate = new Date(Date.now() + 86310000 * 3).toISOString();
    mockConnectionsService.scheduleFollowUp.mockResolvedValue({
      id: 'conn-1',
      status: 'DEFERRED',
      followUpDate: futureDate,
    } as any);

    const result: any = await controller.scheduleFollowUp(mockUser, 'conn-1', futureDate, 'Review after board meeting');
    expect(result.status).toBe('DEFERRED');
    expect(mockConnectionsService.scheduleFollowUp).toHaveBeenCalled();
  });

  it('should withdraw connection request with quota recovery', async () => {
    mockConnectionsService.withdrawConnection.mockResolvedValue({
      success: true,
      quotaRestored: true,
      message: 'Withdrawn',
      connection: { id: 'conn-1', status: 'WITHDRAWN' },
    } as any);

    const result = await controller.withdrawConnection(mockUser, 'conn-1');
    expect(result.success).toBe(true);
    expect(result.quotaRestored).toBe(true);
    expect(mockConnectionsService.withdrawConnection).toHaveBeenCalledWith(mockUser.id, 'conn-1');
  });

  it('should send a gentle reminder nudge', async () => {
    mockConnectionsService.remindConnection.mockResolvedValue({
      success: true,
      message: 'Reminder sent',
      remindedAt: new Date(),
      connection: { id: 'conn-1' },
    } as any);

    const result = await controller.remindConnection(mockUser, 'conn-1', { reminderNote: 'Quick follow up' });
    expect(result.success).toBe(true);
    expect(mockConnectionsService.remindConnection).toHaveBeenCalledWith(mockUser.id, 'conn-1', 'Quick follow up');
  });

  it('should respond to warm introduction with endorsement', async () => {
    mockConnectionsService.respondIntroduction.mockResolvedValue({
      id: 'intro-1',
      status: IntroductionStatus.SENT_TO_TARGET,
    } as any);

    const result = await controller.respondIntroduction(mockUser, 'intro-1', {
      action: IntroductionAction.INTERMEDIARY_ACCEPT,
      endorsementNote: 'Vouched partner for supply chain logistics.',
    });

    expect(result.status).toBe(IntroductionStatus.SENT_TO_TARGET);
    expect(mockConnectionsService.respondIntroduction).toHaveBeenCalledWith(
      mockUser.id,
      'intro-1',
      IntroductionAction.INTERMEDIARY_ACCEPT,
      'Vouched partner for supply chain logistics.',
    );
  });
});
