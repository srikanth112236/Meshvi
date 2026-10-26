import { Test, TestingModule } from '@nestjs/testing';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';

describe('MessagingController', () => {
  let controller: MessagingController;
  let service: MessagingService;

  const mockMessagingService = {
    getConversations: jest.fn(),
    createConversation: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    markAsRead: jest.fn(),
    getEmailOutbox: jest.fn(),
    processOutboxBatch: jest.fn(),
    getMessageStream: jest.fn(),
    generateCalendarIcs: jest.fn().mockReturnValue('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR'),
  };

  const mockUser = { id: 'user-1', email: 'test@vedasynk.local' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagingController],
      providers: [
        {
          provide: MessagingService,
          useValue: mockMessagingService,
        },
      ],
    }).compile();

    controller = module.get<MessagingController>(MessagingController);
    service = module.get<MessagingService>(MessagingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should get conversations for user', async () => {
    mockMessagingService.getConversations.mockResolvedValue([]);
    const res = await controller.getConversations(mockUser);
    expect(Array.isArray(res)).toBe(true);
    expect(mockMessagingService.getConversations).toHaveBeenCalledWith(mockUser.id);
  });

  it('should send a message with rich attachment in a conversation (Feature #47)', async () => {
    const dto = {
      body: 'Hello there, let us discuss the distribution terms.',
      messageType: 'PROPOSAL',
      attachmentUrl: 'https://cdn.projectsetu.com/proposals/p1.pdf',
      attachmentName: 'Commercial_Tender_Proposal.pdf',
    };
    mockMessagingService.sendMessage.mockResolvedValue({ id: 'msg-1', ...dto });

    const res = await controller.sendMessage(mockUser, 'conv-1', dto);
    expect(res).toHaveProperty('id', 'msg-1');
    expect(mockMessagingService.sendMessage).toHaveBeenCalledWith(mockUser.id, 'conv-1', dto);
  });

  it('should schedule mutual calendar meeting and generate ICS invite (Feature #29)', async () => {
    mockMessagingService.sendMessage.mockResolvedValue({
      id: 'msg-mtg-1',
      body: '📅 Proposed Business Meeting: "Distribution Strategy" scheduled for 2026-10-15.',
      messageType: 'MEETING_INVITE',
    });

    const meetingRes = await controller.scheduleMeeting(mockUser, 'conv-1', {
      title: 'Distribution Strategy',
      startTime: '2026-10-15T10:00:00Z',
      endTime: '2026-10-15T10:30:00Z',
    });
    expect(meetingRes.messageType).toBe('MEETING_INVITE');

    const icsRes = await controller.downloadMeetingIcs(mockUser, 'conv-1', 'Distribution Strategy');
    expect(icsRes.success).toBe(true);
    expect(icsRes.contentType).toBe('text/calendar; charset=utf-8');
    expect(icsRes.icsContent).toContain('BEGIN:VCALENDAR');
  });

  it('should return real-time SSE stream for conversation', (done) => {
    const { of } = require('rxjs');
    mockMessagingService.getMessageStream.mockReturnValue(of({ data: { id: 'msg-stream-1', body: 'Realtime update' } }));

    const stream$ = controller.streamMessages(mockUser, 'conv-1');
    expect(mockMessagingService.getMessageStream).toHaveBeenCalledWith(mockUser.id, 'conv-1');

    stream$.subscribe((event) => {
      expect(event.data).toHaveProperty('id', 'msg-stream-1');
      done();
    });
  });
});
