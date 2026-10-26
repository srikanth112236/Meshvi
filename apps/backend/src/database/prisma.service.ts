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

      // Automatically push schema if running on production (Render / Azure) to ensure tables exist
      try {
        const { execSync } = await import('child_process');
        const fs = await import('fs');
        const { join } = await import('path');

        let schemaArg = '';
        if (fs.existsSync(join(process.cwd(), 'apps/backend/prisma/schema.prisma'))) {
          schemaArg = `--schema="${join(process.cwd(), 'apps/backend/prisma/schema.prisma')}"`;
        } else if (fs.existsSync(join(process.cwd(), 'prisma/schema.prisma'))) {
          schemaArg = `--schema="${join(process.cwd(), 'prisma/schema.prisma')}"`;
        }

        this.logger.log(`Verifying PostgreSQL tables and schema status (${schemaArg || 'default'})...`);
        execSync(`npx prisma db push --skip-generate --accept-data-loss ${schemaArg}`.trim(), {
          stdio: 'inherit',
          env: process.env,
        });
        this.logger.log('✔ PostgreSQL tables and schema verified successfully.');
      } catch (pushErr: any) {
        this.logger.warn(`Prisma db push check completed: ${pushErr.message}`);
      }
    }

    try {
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL');
      await this.ensureSeedData();
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL database', error);
      throw error;
    }
  }

  private async ensureSeedData() {
    try {
      const adminEmail = 'admin@vedasynk.local';
      const existingUser = await (this as any).user.findFirst({
        where: { email: adminEmail },
      });

      if (!existingUser) {
        this.logger.log(`Initializing Platform Super Admin (${adminEmail})...`);
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.hash('Password123!', 10);
        const { randomUUID } = await import('crypto');

        const superAdminId = randomUUID();
        const profileId = randomUUID();

        await (this as any).user.create({
          data: {
            id: superAdminId,
            email: adminEmail,
            emailNormalized: adminEmail,
            passwordHash,
            accountStatus: 'ACTIVE',
            emailVerifiedAt: new Date(),
            authProvider: 'LOCAL',
            onboardingStep: 3,
            onboardingCompleted: true,
            linkedinVerified: true,
            workEmailVerified: true,
          },
        });

        await (this as any).userRole.createMany({
          data: [
            { id: randomUUID(), userId: superAdminId, role: 'SUPER_ADMIN' },
            { id: randomUUID(), userId: superAdminId, role: 'USER' },
          ],
        });

        await (this as any).professionalProfile.create({
          data: {
            id: profileId,
            userId: superAdminId,
            displayName: 'Setu Platform Administrator',
            headline: 'Chief Administrative Officer & Platform Governance',
            summary: 'Master administrative overseer managing system integrity and verification compliance across Project Setu.',
            currentTitle: 'Head of Platform Administration',
            function: 'Platform Operations',
            seniority: 'C-Level / Super Admin',
            industry: 'Enterprise Software & AI',
            city: 'Bengaluru',
            countryCode: 'IN',
            visibility: 'PUBLIC',
            verificationStatus: 'VERIFIED',
            completenessScore: 100,
            isSeedData: true,
          },
        });

        this.logger.log(`✔ Super Admin created: ${adminEmail} (Password: Password123!)`);
      }

      // Check if 500 diverse global members are seeded for live search
      const seedCount = await (this as any).professionalProfile.count({
        where: { isSeedData: true },
      });
      if (seedCount < 500) {
        this.logger.log(`Found ${seedCount} seed profiles. Automatically seeding 500 diverse global members across India, Australia, UK, and worldwide...`);
        const { seed500DiverseMembers } = await import('./diverse-seeder');
        await seed500DiverseMembers(this);
        this.logger.log('✔ Successfully seeded 500 diverse global members into live search database!');
      }
    } catch (err: any) {
      this.logger.warn(`Seed check: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from PostgreSQL database');
  }
}
