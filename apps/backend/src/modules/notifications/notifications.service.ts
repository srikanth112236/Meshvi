import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType } from '@prisma/client';
import { Subject, Observable, merge, interval } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface CreateNotificationDto {
  userId: string;
  actorId?: string;
  actorName?: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly notificationStream$ = new Subject<any>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a persistent notification for a user and emit via real-time stream
   */
  async createNotification(dto: CreateNotificationDto) {
    const created = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        actorId: dto.actorId,
        actorName: dto.actorName,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        actionUrl: dto.actionUrl,
        metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
      },
    });

    // Real-time reactive dispatch
    this.notificationStream$.next(created);

    return created;
  }

  /**
   * Subscribe to real-time notification stream for specific user
   */
  getNotificationStream(userId: string): Observable<{ data: any }> {
    const notifs$ = this.notificationStream$.pipe(
      filter((notification) => notification.userId === userId),
      map((notification) => ({ data: notification })),
    );
    const heartbeat$ = interval(20000).pipe(
      map(() => ({ data: { type: 'HEARTBEAT', timestamp: new Date().toISOString() } })),
    );
    return merge(notifs$, heartbeat$);
  }

  /**
   * Get all notifications for current user with unread counter
   */
  async getUserNotifications(userId: string, limit: number = 50) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    });
  }

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { success: true };
  }
}
