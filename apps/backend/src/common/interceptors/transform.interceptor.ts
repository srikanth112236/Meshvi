import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

const SENSITIVE_KEYS = new Set([
  'passwordHash',
  'password',
  'twoFactorSecret',
  'twoFactorRecoveryCodes',
  'emailVerificationToken',
  'passwordResetToken',
  'refreshTokenHash',
  'workEmail',
]);

function sanitizeSensitive(value: any): any {
  if (Array.isArray(value)) {
    return value.map(sanitizeSensitive);
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const clean: Record<string, any> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key)) {
        continue;
      }
      clean[key] = sanitizeSensitive(nested);
    }
    return clean;
  }

  return value;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseEnvelope<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseEnvelope<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;
    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode,
        data: sanitizeSensitive(data),
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
