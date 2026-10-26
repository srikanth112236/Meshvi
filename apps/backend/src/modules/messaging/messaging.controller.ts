import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { MessagingService } from './messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalScopeGuard } from '../auth/guards/portal-scope.guard';
import { PortalScope } from '../auth/decorators/portal-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Messaging & Email Outbox')
@Controller()
@UseGuards(JwtAuthGuard, PortalScopeGuard)
@PortalScope('CONSUMER', 'COMPANY_ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'List all direct conversations for current user' })
  async getConversations(@CurrentUser() user: any) {
    return this.messagingService.getConversations(user.id);
  }

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or resume direct conversation with a verified connection' })
  async createConversation(
    @CurrentUser() user: any,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagingService.createConversation(user.id, dto);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get all messages in a conversation' })
  async getMessages(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
  ) {
    return this.messagingService.getMessages(user.id, conversationId);
  }

  @Sse('conversations/:id/stream')
  @ApiOperation({ summary: 'Real-time Server-Sent Events stream for incoming conversation messages' })
  streamMessages(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
  ): Observable<{ data: any }> {
    return this.messagingService.getMessageStream(user.id, conversationId);
  }

  @Post('conversations/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message in an active conversation' })
  async sendMessage(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(user.id, conversationId, dto);
  }

  @Patch('conversations/:id/messages/:messageId')
  @ApiOperation({ summary: 'Edit message (allowed within 30 minutes of sending)' })
  async editMessage(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Param('messageId') messageId: string,
    @Body('body') body: string,
  ) {
    return this.messagingService.editMessage(user.id, conversationId, messageId, body);
  }

  @Delete('conversations/:id/messages/:messageId')
  @ApiOperation({ summary: 'Delete message for everyone or for current user' })
  async deleteMessage(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Param('messageId') messageId: string,
    @Query('mode') mode?: 'everyone' | 'me',
  ) {
    return this.messagingService.deleteMessage(user.id, conversationId, messageId, mode || 'everyone');
  }

  @Post('conversations/:id/report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Report conversation or participant for trust & safety' })
  async reportConversation(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Body() body: { reason: string; notes?: string },
  ) {
    return this.messagingService.reportConversation(user.id, conversationId, body.reason, body.notes);
  }

  @Post('conversations/:id/block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Block conversation partner' })
  async blockConversation(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
  ) {
    return this.messagingService.blockConversation(user.id, conversationId);
  }

  @Post('conversations/:id/unblock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unblock conversation partner' })
  async unblockConversation(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
  ) {
    return this.messagingService.unblockConversation(user.id, conversationId);
  }

  @Post('conversations/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark conversation messages as read' })
  async markAsRead(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
  ) {
    return this.messagingService.markAsRead(user.id, conversationId);
  }

  @Post('conversations/:id/typing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Broadcast user typing indicator in conversation' })
  async broadcastTyping(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Body('isTyping') isTyping: boolean,
  ) {
    await this.messagingService.broadcastTyping(user.id, conversationId, isTyping);
    return { success: true };
  }

  @Post('conversations/:id/meetings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Feature #29: Schedule mutual calendar business meeting in conversation' })
  async scheduleMeeting(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Body()
    body: {
      title: string;
      description?: string;
      startTime: string;
      endTime: string;
      location?: string;
    },
  ) {
    const meetingPayload = {
      meetingId: `mtg-${Date.now()}`,
      title: body.title,
      description: body.description || 'Project Setu Commercial Bridge Introduction',
      startTime: body.startTime,
      endTime: body.endTime,
      location: body.location || 'Project Setu Virtual Conference Room',
    };

    return this.messagingService.sendMessage(user.id, conversationId, {
      body: `📅 Proposed Business Meeting: "${body.title}" scheduled for ${new Date(body.startTime).toLocaleString()}.`,
      messageType: 'MEETING_INVITE',
      meetingPayloadJson: JSON.stringify(meetingPayload),
    });
  }

  @Get('conversations/:id/meetings/ics')
  @ApiOperation({ summary: 'Feature #29: Generate and download standard .ics calendar invite' })
  async downloadMeetingIcs(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Query('title') title?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('location') location?: string,
  ) {
    const start = startTime ? new Date(startTime) : new Date(Date.now() + 3600000);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 1800000);

    const icsContent = this.messagingService.generateCalendarIcs({
      meetingId: `setu-mtg-${conversationId.substring(0, 8)}`,
      title: title || 'Project Setu Commercial Discussion',
      description: 'Scheduled commercial alignment meeting through Project Setu Enterprise Bridge.',
      startTime: start,
      endTime: end,
      organizerName: user.email?.split('@')[0] || 'Setu Organizer',
      organizerEmail: user.email || 'noreply@projectsetu.com',
      location: location || 'Project Setu Virtual Conference Room',
    });

    return {
      success: true,
      filename: 'meeting-invite.ics',
      contentType: 'text/calendar; charset=utf-8',
      icsContent,
    };
  }

  @Get('email-outbox')
  @ApiOperation({ summary: 'List recent transactional emails in outbox' })
  async getEmailOutbox(@Query('status') status?: string) {
    return this.messagingService.getEmailOutbox(status);
  }

  @Post('email-outbox/process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger transactional email outbox batch delivery' })
  async processOutboxBatch() {
    return this.messagingService.processOutboxBatch(10);
  }
}
