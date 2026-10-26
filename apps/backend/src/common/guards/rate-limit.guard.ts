import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const RATE_LIMIT_KEY = 'rate_limit';
export interface RateLimitOptions {
  limit: number;       // Maximum requests
  windowMs: number;    // Window duration in ms
  actionName?: string; // Descriptive action for logs
}

export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

interface ClientRecord {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private static readonly clientBuckets = new Map<string, ClientRecord>();

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no custom rate limit applied, default to permissive 120 reqs / min
    const limit = options?.limit ?? 120;
    const windowMs = options?.windowMs ?? 60 * 1000;
    const action = options?.actionName ?? 'GENERAL_API';

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const clientId = user ? `user_${user.id}_${action}` : `ip_${clientIp}_${action}`;

    const now = Date.now();
    let record = RateLimitGuard.clientBuckets.get(clientId);

    if (!record || now > record.resetAt) {
      record = {
        count: 1,
        resetAt: now + windowMs,
      };
      RateLimitGuard.clientBuckets.set(clientId, record);
      return true;
    }

    record.count++;

    if (record.count > limit) {
      const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
      this.logger.warn(`Rate limit exceeded for [${clientId}]: ${record.count}/${limit}. Action: ${action}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Velocity throttle active for ${action}. Limit of ${limit} exceeded. Please retry in ${waitSeconds}s.`,
          retryAfterSeconds: waitSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
