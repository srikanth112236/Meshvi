import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Observable, of } from 'rxjs';

@ApiTags('Real-time Notifications')
@Controller('notifications')
@UseGuards(OptionalJwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('stream')
  @ApiOperation({ summary: 'Real-time reactive Server-Sent Events stream for instant notification push' })
  streamNotifications(@CurrentUser() user: any): Observable<{ data: any }> {
    if (!user?.id) {
      return of({ data: { type: 'HEARTBEAT', timestamp: new Date().toISOString() } });
    }
    return this.notificationsService.getNotificationStream(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user notifications and unread count' })
  async getNotifications(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ) {
    if (!user?.id) {
      return {
        success: true,
        data: {
          notifications: [],
          unreadCount: 0,
        },
      };
    }
    return this.notificationsService.getUserNotifications(
      user.id,
      limit ? Number(limit) : 50,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark specific notification as read' })
  async markAsRead(
    @CurrentUser() user: any,
    @Param('id') notificationId: string,
  ) {
    if (!user?.id) return { success: true };
    return this.notificationsService.markAsRead(user.id, notificationId);
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  async markAllAsRead(@CurrentUser() user: any) {
    if (!user?.id) return { success: true };
    return this.notificationsService.markAllAsRead(user.id);
  }
}
