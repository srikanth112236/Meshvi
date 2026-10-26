import { Module } from '@nestjs/common';
import { TriggersController } from './triggers.controller';
import { TriggersService } from './triggers.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [TriggersController],
  providers: [TriggersService, PrismaService],
  exports: [TriggersService],
})
export class TriggersModule {}
