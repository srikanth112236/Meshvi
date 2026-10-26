import { Module } from '@nestjs/common';
import { ReputationController } from './reputation.controller';
import { ReputationService } from './reputation.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ReputationController],
  providers: [ReputationService, PrismaService],
  exports: [ReputationService],
})
export class ReputationModule {}
