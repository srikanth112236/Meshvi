import { Module } from '@nestjs/common';
import { ReadinessController } from './readiness.controller';
import { ReadinessService } from './readiness.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ReadinessController],
  providers: [ReadinessService, PrismaService],
  exports: [ReadinessService],
})
export class ReadinessModule {}
