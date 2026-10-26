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
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3100';

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Flexible CORS configuration for Web, Local Network Mobile Devices & Expo
  app.enableCors({
    origin: (origin, callback) => {
      // Allow mobile apps, curl, Postman (which have no origin header) and any local network device
      if (!origin || origin.includes('localhost') || origin.includes('192.168.1.6') || origin.includes('10.236.182.78') || origin.includes('127.0.0.1') || origin.startsWith('exp://')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation & Envelope
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
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
