import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { json, urlencoded } from 'express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ensure uploads directory exists on disk
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });

  // Increase payload limit to 50mb for enterprise media attachments & documents
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Locked Backend Port: 3500
  const port = process.env.PORT || 3500;
  const frontendUrl = process.env.FRONTEND_URL || 'https://meshvi.org';

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Explicit CORS allow-list for Web, Local Network Mobile Devices & Expo.
  // Wildcard credentials are never permitted.
  const configuredOrigins = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    process.env.MOBILE_APP_ORIGIN,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const allowAllOrigins = process.env.CORS_ALLOW_ALL === 'true';
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const localOriginPattern =
    /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

  const hostnameOf = (value: string): string => {
    try {
      return new URL(value).hostname.toLowerCase();
    } catch {
      return '';
    }
  };

  app.enableCors({
    origin: (origin, callback) => {
      // Native mobile apps, server-to-server calls and curl often omit the Origin header.
      if (!origin) {
        return callback(null, true);
      }
      if (allowAllOrigins) {
        return callback(null, true);
      }

      const normalized = origin.trim().replace(/\/$/, '');
      if (configuredOrigins.includes(normalized)) {
        return callback(null, true);
      }

      const originHost = hostnameOf(normalized);
      const sameConfiguredHost = configuredOrigins.some((allowed) => {
        const allowedHost = hostnameOf(allowed);
        return (
          !!allowedHost &&
          !!originHost &&
          (originHost === allowedHost || originHost.endsWith(`.${allowedHost}`))
        );
      });
      if (sameConfiguredHost) {
        return callback(null, true);
      }

      if (isDevelopment && localOriginPattern.test(normalized)) {
        return callback(null, true);
      }

      logger.warn(`Blocked CORS origin: ${origin}`);
      return callback(null, false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'x-client-portal',
      'Cache-Control',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  // Global Validation & Envelope
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('MESHVI API')
    .setDescription('MESHVI — Intent-driven B2B professional & business discovery connection platform')
    .setVersion('1.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  });

  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`, err.stack);
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`====================================================`);
  logger.log(`  MESHVI Backend running on: http://0.0.0.0:${port}/api/v1 (LAN: http://192.168.1.6:${port}/api/v1)`);
  logger.log(`  OpenAPI Documentation:     http://localhost:${port}/api/docs`);
  logger.log(`  Frontend Origin:           ${frontendUrl}`);
  logger.log(`====================================================`);
}

bootstrap();
