import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ImportsController],
  providers: [ImportsService, PrismaService],
  exports: [ImportsService],
})
export class ImportsModule {}
