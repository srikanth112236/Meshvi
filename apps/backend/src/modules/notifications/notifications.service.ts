import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType } from '@prisma/client';
import { Subject, Observable, merge, interval } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Cron, CronExpression } from '@nestjs/schedule';

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
   * Create a persistent notification for a user and optionally emit via real-time stream
   */
  async createNotification(dto: CreateNotificationDto, emitToStream: boolean = true) {
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

    // Real-time reactive dispatch only for interactive peer notifications
    if (emitToStream) {
      this.notificationStream$.next(created);
    }

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
   * Generates a weekly personalized partner recommendation notification
   * for users who have completed onboarding, if they haven't received one in the last 7 days.
   */
  async ensureWeeklyRecommendationsNotification(userId: string) {
    if (!userId) return null;

    // Check if user exists and has completed onboarding
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: { company: true },
        },
      },
    });

    // Do NOT generate weekly recommendations for unverified or incomplete onboarding users
    if (!user || !user.onboardingCompleted || !user.profile) {
      return null;
    }

    const userProfile = user.profile;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Check if user already got a weekly recommendation this week
    const existing = await this.prisma.notification.findFirst({
      where: {
        userId,
        title: { contains: 'Weekly', mode: 'insensitive' },
        createdAt: { gte: sevenDaysAgo },
      },
    });

    if (existing) {
      return existing;
    }

    const userIndustry = userProfile.industry || 'Technology & Innovation';
    const userFunction = userProfile.function
      ? userProfile.function.split(';')[0].trim()
      : 'Commercial & Strategy';

    // Find up to 3 verified profiles in the directory (excluding the user)
    const matches = await this.prisma.professionalProfile.findMany({
      where: {
        userId: { not: userId },
        user: { onboardingCompleted: true },
      },
      include: {
        company: true,
      },
      orderBy: [
        { completenessScore: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 3,
    });

    if (matches.length === 0) {
      return null;
    }

    const matchesCount = matches.length;
    const names = matches
      .map((m) => m.displayName)
      .filter(Boolean)
      .slice(0, 2)
      .join(' & ');

    const title = `🎯 Weekly Recommendations: ${matchesCount} Verified Matches`;
    const body = names
      ? `We found ${matchesCount} verified leaders including ${names} aligned with your ${userFunction} focus in ${userIndustry}. Explore your weekly matches now.`
      : `We found ${matchesCount} verified business leaders aligned with your ${userFunction} focus in ${userIndustry}. Tap to view.`;

    // Persist silently into the Notification Hub without blasting real-time interrupting stream
    return this.createNotification(
      {
        userId,
        type: NotificationType.SYSTEM_ALERT,
        title,
        body,
        actionUrl: '/app/search?tab=PROFILES',
        metadata: {
          category: 'WEEKLY_RECOMMENDATIONS',
          matchesCount,
          industry: userIndustry,
          function: userFunction,
        },
      },
      false, // emitToStream: false — silent drawer update
    );
  }

  /**
   * Weekly scheduled cron job running every Monday at 9:00 AM server time
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyRecommendationsCron() {
    try {
      const activeUsers = await this.prisma.user.findMany({
        where: { onboardingCompleted: true, accountStatus: 'ACTIVE' },
        select: { id: true },
        take: 100,
      });

      for (const u of activeUsers) {
        if (u.id) {
          await this.ensureWeeklyRecommendationsNotification(u.id);
        }
      }
    } catch {
      // Non-blocking cron
    }
  }

  /**
   * Get all notifications for current user with unread counter (Pure read-only query)
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
