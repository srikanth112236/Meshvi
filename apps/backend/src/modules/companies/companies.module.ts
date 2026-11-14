import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../../database/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

@Module({
  imports: [AuthModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, PrismaService, RateLimitGuard],
  exports: [CompaniesService],
})
export class CompaniesModule {}
