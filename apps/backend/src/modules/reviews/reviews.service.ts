import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';

const REVIEW_USER_SELECT = {
  id: true,
  email: true,
  profile: {
    select: {
      displayName: true,
      headline: true,
      avatarUrl: true,
    },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  /** Server-side ceiling only. Never exposed as a UI hint. */
  private readonly maxReviewsPerMember = 5;

  constructor(private readonly prisma: PrismaService) {}

  /** Public wall of published reviews with aggregate rating telemetry. */
  async getPublicReviews() {
    const [aggregate, distribution, categoryGroups, reviews] = await Promise.all([
      this.prisma.appReview.aggregate({
        where: { status: ReviewStatus.PUBLISHED },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      this.prisma.appReview.groupBy({
        by: ['rating'],
        where: { status: ReviewStatus.PUBLISHED },
        _count: { _all: true },
      }),
      this.prisma.appReview.groupBy({
        by: ['category'],
        where: { status: ReviewStatus.PUBLISHED },
        _count: { _all: true },
      }),
      this.prisma.appReview.findMany({
        where: { status: ReviewStatus.PUBLISHED },
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: { user: { select: REVIEW_USER_SELECT } },
      }),
    ]);

    const totalPublished = aggregate._count._all;
    const averageRating =
      totalPublished > 0 ? Math.round((aggregate._avg.rating || 0) * 10) / 10 : 0;

    const ratingDistribution: Record<string, number> = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };
    for (const row of distribution) {
      ratingDistribution[String(row.rating)] = row._count._all;
    }

    const categoryCounts: Record<string, number> = {};
    for (const row of categoryGroups) {
      categoryCounts[row.category] = row._count._all;
    }

    return {
      stats: {
        totalPublished,
        averageRating,
        ratingDistribution,
        categoryCounts,
      },
      reviews: reviews.map((review) => this.toPublicReview(review)),
    };
  }

  /** Every review owned by the authenticated member (any status). */
  async getMyReviews(userId: string) {
    const reviews = await this.prisma.appReview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map((review) => this.toOwnReview(review));
  }

  async submitReview(userId: string, dto: CreateReviewDto) {
    const existingCount = await this.prisma.appReview.count({ where: { userId } });
    if (existingCount >= this.maxReviewsPerMember) {
      throw new BadRequestException(
        'You have reached the maximum number of reviews for this account. Please delete an existing review before submitting another.',
      );
    }

    const review = await this.prisma.appReview.create({
      data: {
        userId,
        rating: dto.rating,
        category: dto.category || 'GENERAL',
        title: dto.title?.trim() || null,
        message: dto.message.trim(),
        isAnonymous: dto.isAnonymous ?? false,
        status: ReviewStatus.PENDING,
      },
    });

    this.logger.log(`New application review submitted by user ${userId} (${dto.rating}/5)`);
    return this.toOwnReview(review);
  }

  async updateMyReview(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const existing = await this.prisma.appReview.findFirst({
      where: { id: reviewId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Review not found.');
    }

    const review = await this.prisma.appReview.update({
      where: { id: reviewId },
      data: {
        ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.title !== undefined ? { title: dto.title?.trim() || null } : {}),
        ...(dto.message !== undefined ? { message: dto.message.trim() } : {}),
        ...(dto.isAnonymous !== undefined ? { isAnonymous: dto.isAnonymous } : {}),
        // Edited content re-enters the moderation queue and supersedes any prior reply.
        status: ReviewStatus.PENDING,
        adminReply: null,
        repliedAt: null,
        repliedBy: null,
      },
    });

    this.logger.log(`Application review ${reviewId} updated by user ${userId}; returned to moderation queue`);
    return this.toOwnReview(review);
  }

  async deleteMyReview(userId: string, reviewId: string) {
    const existing = await this.prisma.appReview.findFirst({
      where: { id: reviewId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Review not found.');
    }

    await this.prisma.appReview.delete({ where: { id: reviewId } });
    return { message: 'Your review has been removed.' };
  }

  /** Moderation console: every review plus queue telemetry. */
  async getModerationQueue(status?: ReviewStatus, query?: string) {
    const search = query?.trim();
    const where: Prisma.AppReviewWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { message: { contains: search, mode: 'insensitive' } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [reviews, total, pending, published, hidden, average] = await Promise.all([
      this.prisma.appReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 500,
        include: { user: { select: REVIEW_USER_SELECT } },
      }),
      this.prisma.appReview.count(),
      this.prisma.appReview.count({ where: { status: ReviewStatus.PENDING } }),
      this.prisma.appReview.count({ where: { status: ReviewStatus.PUBLISHED } }),
      this.prisma.appReview.count({ where: { status: ReviewStatus.HIDDEN } }),
      this.prisma.appReview.aggregate({
        where: { status: ReviewStatus.PUBLISHED },
        _avg: { rating: true },
      }),
    ]);

    return {
      stats: {
        total,
        pending,
        published,
        hidden,
        averageRating:
          published > 0 ? Math.round((average._avg.rating || 0) * 10) / 10 : 0,
      },
      reviews: reviews.map((review) => this.toAdminReview(review)),
    };
  }

  async moderateReview(id: string, dto: ModerateReviewDto, moderator: any) {
    const existing = await this.prisma.appReview.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Review not found.');
    }

    const reply = dto.adminReply !== undefined ? dto.adminReply.trim() : undefined;
    const hasReply = reply !== undefined;

    const updated = await this.prisma.appReview.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(hasReply
          ? {
              adminReply: reply || null,
              repliedAt: reply ? new Date() : null,
              repliedBy: reply ? moderator.email : null,
            }
          : {}),
      },
      include: { user: { select: REVIEW_USER_SELECT } },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: moderator.id,
        action: 'APP_REVIEW_MODERATED',
        resource: 'APP_REVIEW',
        resourceId: id,
        metadata: JSON.stringify({
          status: updated.status,
          replyChanged: hasReply,
          reviewerId: updated.userId,
        }),
      },
    });

    this.logger.log(
      `Review ${id} moderated by ${moderator.email} -> ${updated.status}${
        hasReply ? ' (reply updated)' : ''
      }`,
    );

    return this.toAdminReview(updated);
  }

  async deleteReview(id: string, moderator: any) {
    const existing = await this.prisma.appReview.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Review not found.');
    }

    await this.prisma.appReview.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        userId: moderator.id,
        action: 'APP_REVIEW_DELETED',
        resource: 'APP_REVIEW',
        resourceId: id,
        metadata: JSON.stringify({ reviewerId: existing.userId, rating: existing.rating }),
      },
    });

    return { message: 'Review permanently deleted.' };
  }

  private toOwnReview(review: any) {
    return {
      id: review.id,
      rating: review.rating,
      category: review.category,
      title: review.title,
      message: review.message,
      isAnonymous: review.isAnonymous,
      status: review.status,
      adminReply: review.adminReply,
      repliedAt: review.repliedAt,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  private toPublicReview(review: any) {
    const profile = review.user?.profile;
    const fallbackName = review.user?.email ? String(review.user.email).split('@')[0] : null;
    const authorName = review.isAnonymous
      ? 'MESHVI Member'
      : profile?.displayName || fallbackName || 'MESHVI Member';

    return {
      id: review.id,
      rating: review.rating,
      category: review.category,
      title: review.title,
      message: review.message,
      isAnonymous: review.isAnonymous,
      authorName,
      authorHeadline: review.isAnonymous ? null : profile?.headline || null,
      authorAvatarUrl: review.isAnonymous ? null : profile?.avatarUrl || null,
      adminReply: review.adminReply,
      repliedAt: review.repliedAt,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  private toAdminReview(review: any) {
    return {
      id: review.id,
      rating: review.rating,
      category: review.category,
      title: review.title,
      message: review.message,
      isAnonymous: review.isAnonymous,
      status: review.status,
      adminReply: review.adminReply,
      repliedAt: review.repliedAt,
      repliedBy: review.repliedBy,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      author: {
        id: review.user?.id,
        email: review.user?.email,
        name: review.user?.profile?.displayName || null,
        headline: review.user?.profile?.headline || null,
        avatarUrl: review.user?.profile?.avatarUrl || null,
      },
    };
  }
}
