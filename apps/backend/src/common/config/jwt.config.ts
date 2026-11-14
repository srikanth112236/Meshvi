import { Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

const logger = new Logger('JwtConfig');

let cachedSecret: string | null = null;

const WEAK_SECRET_MARKERS = [
  'your_super_secret',
  'change_me',
  'changeme',
  'placeholder',
  'setu_super_secret_jwt_key_dev',
];

/**
 * Resolves the JWT signing secret.
 *
 * Production MUST provide a strong JWT_SECRET (>= 32 chars). Development falls back to a
 * per-process random secret so the platform never ships a publicly-known signing key.
 */
export function getJwtSecret(): string {
  if (cachedSecret) {
    return cachedSecret;
  }

  const envSecret = process.env.JWT_SECRET?.trim();
  const looksStrong =
    !!envSecret &&
    envSecret.length >= 32 &&
    !WEAK_SECRET_MARKERS.some((marker) => envSecret.toLowerCase().includes(marker));

  if (looksStrong) {
    cachedSecret = envSecret as string;
    return cachedSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL: JWT_SECRET must be set to a strong value (at least 32 characters) in production. ' +
        'Refusing to start with a missing or default signing key.',
    );
  }

  cachedSecret = randomBytes(48).toString('hex');
  logger.warn(
    'JWT_SECRET is missing or weak. Generated an ephemeral development signing key — ' +
      'all sessions are invalidated when the server restarts. Set JWT_SECRET in .env for stable sessions.',
  );
  return cachedSecret;
}

export function getAccessTokenTtl(): string {
  return process.env.JWT_ACCESS_EXPIRES_IN || '15m';
}

export function getRefreshTokenTtl(): string {
  return process.env.JWT_REFRESH_EXPIRES_IN || '7d';
}
