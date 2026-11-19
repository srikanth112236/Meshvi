import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/**
 * Restricts review moderation to an explicit email allow-list or Super Admins.
 * The allow-list can be extended with REVIEW_MODERATOR_EMAILS (comma separated).
 */
@Injectable()
export class ReviewModeratorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required for review moderation.');
    }

    const email = String(user.email || '').trim().toLowerCase();
    const roles: string[] = user.roles || [];

    if (roles.includes('SUPER_ADMIN')) {
      return true;
    }

    const allowList = (
      process.env.REVIEW_MODERATOR_EMAILS || 'meshviconnect@gmail.com,vedasynk@gmail.com'
    )
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (allowList.includes(email)) {
      return true;
    }

    throw new ForbiddenException(
      'Your account does not have clearance to moderate MESHVI member reviews.',
    );
  }
}
