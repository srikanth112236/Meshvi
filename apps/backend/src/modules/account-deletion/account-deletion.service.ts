import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { RequestAccountDeletionDto } from './dto/request-deletion.dto';

@Injectable()
export class AccountDeletionService {
  private readonly logger = new Logger(AccountDeletionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Request account deletion (public, unauthenticated endpoint).
   * Complies with Google Play Console account deletion policy.
   *
   * To prevent email enumeration attacks, this method always returns a uniform
   * success message regardless of whether the email address was found.
   */
  async requestDeletion(dto: RequestAccountDeletionDto) {
    if (!dto.confirm) {
      throw new BadRequestException('Confirmation checkbox must be acknowledged.');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    try {
      // Look up user by email or emailNormalized
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ email: normalizedEmail }, { emailNormalized: normalizedEmail }],
        },
      });

      if (user) {
        // Soft delete user and set timestamp if not already marked
        if (!user.deletedAt) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              deletedAt: new Date(),
              accountStatus: 'DEACTIVATED',
            },
          });
          this.logger.log(
            `[AccountDeletion] Account marked for deletion: user_id=${user.id}, email=${normalizedEmail}`,
          );
        } else {
          this.logger.log(
            `[AccountDeletion] Account already marked for deletion: user_id=${user.id}`,
          );
        }
      } else {
        // Log silently for audit purposes without revealing anything to the caller
        this.logger.warn(
          `[AccountDeletion] Deletion requested for non-existent email: ${normalizedEmail}`,
        );
      }
    } catch (err: any) {
      this.logger.error(`[AccountDeletion] Error flagging user for deletion: ${err.message}`, err.stack);
      // Still don't leak database errors to attackers, but allow re-throw if critical
      throw err;
    }

    return {
      success: true,
      message:
        'If an account exists with this email address, a deletion request has been scheduled. All associated data will be permanently purged after the 14-day grace period.',
    };
  }

  /**
   * Automated cron job running every day at midnight (00:00:00) server time.
   * Permanently hard-deletes any accounts marked for deletion older than 14 days.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'account-cleanup-job',
  })
  async cleanupExpiredDeletedAccounts(): Promise<void> {
    const RETENTION_DAYS = 14;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    this.logger.log(
      `[AccountCleanup] Running daily cleanup cron job. Purging accounts deleted before ${cutoffDate.toISOString()}...`,
    );

    try {
      // Find candidate users deleted 14 or more days ago
      const usersToPurge = await this.prisma.user.findMany({
        where: {
          deletedAt: {
            lte: cutoffDate,
          },
        },
        select: { id: true, email: true },
      });

      if (usersToPurge.length === 0) {
        this.logger.log('[AccountCleanup] No expired accounts found to purge.');
        return;
      }

      this.logger.log(
        `[AccountCleanup] Found ${usersToPurge.length} account(s) ready for permanent hard-delete.`,
      );

      let purgedCount = 0;

      for (const u of usersToPurge) {
        try {
          await this.prisma.$transaction(async (tx) => {
            // Nullify createdByUserId references in conversations so foreign key constraints don't block deletion
            await tx.conversation.updateMany({
              where: { createdByUserId: u.id },
              data: { createdByUserId: null as any },
            }).catch(() => null);

            // Delete user - all cascade relationships are purged automatically
            await tx.user.delete({
              where: { id: u.id },
            });
          });

          purgedCount++;
          this.logger.log(`[AccountCleanup] Permanently purged user: id=${u.id}, email=${u.email}`);
        } catch (innerErr: any) {
          this.logger.error(
            `[AccountCleanup] Failed to hard-delete user id=${u.id}: ${innerErr.message}`,
            innerErr.stack,
          );
        }
      }

      this.logger.log(
        `[AccountCleanup] Successfully purged ${purgedCount} of ${usersToPurge.length} expired accounts.`,
      );
    } catch (err: any) {
      this.logger.error(`[AccountCleanup] Job failed: ${err.message}`, err.stack);
    }
  }
}
