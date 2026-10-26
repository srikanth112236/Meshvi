import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      this.logger.error('CRITICAL: DATABASE_URL environment variable is missing or empty! Please set DATABASE_URL in your hosting environment variables (e.g. Render Dashboard -> Environment).');
    } else {
      try {
        const sanitized = dbUrl.replace(/:([^:@]+)@/, ':****@');
        this.logger.log(`Connecting to database: ${sanitized}`);
      } catch {
        this.logger.log('Connecting to database...');
      }
    }
    try {
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL');
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from PostgreSQL database');
  }
}
