import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { ContactModule } from './modules/contact/contact.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ImportsModule } from './modules/imports/imports.module';
import { SearchModule } from './modules/search/search.module';
import { AiModule } from './modules/ai/ai.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReadinessModule } from './modules/readiness/readiness.module';
import { DealRoomsModule } from './modules/deal-rooms/deal-rooms.module';
import { TriggersModule } from './modules/triggers/triggers.module';
import { ReputationModule } from './modules/reputation/reputation.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { PrismaService } from './database/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    HealthModule,
    ContactModule,
    AuthModule,
    ProfilesModule,
    CompaniesModule,
    ImportsModule,
    SearchModule,
    AiModule,
    ConnectionsModule,
    MessagingModule,
    AdminModule,
    NotificationsModule,
    // Next-Gen Features (F1-F5)
    ReadinessModule,
    DealRoomsModule,
    TriggersModule,
    ReputationModule,
    // Gap 1: Mutual Opportunity Matching
    OpportunitiesModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
