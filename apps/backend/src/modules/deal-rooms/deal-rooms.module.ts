import { Module } from '@nestjs/common';
import { DealRoomsController } from './deal-rooms.controller';
import { DealRoomsService } from './deal-rooms.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [DealRoomsController],
  providers: [DealRoomsService, PrismaService],
  exports: [DealRoomsService],
})
export class DealRoomsModule {}
