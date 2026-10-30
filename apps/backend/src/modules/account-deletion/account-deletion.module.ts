import { Module } from '@nestjs/common';
import { AccountDeletionController } from './account-deletion.controller';
import { AccountDeletionService } from './account-deletion.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [AccountDeletionController],
  providers: [AccountDeletionService, PrismaService],
  exports: [AccountDeletionService],
})
export class AccountDeletionModule {}
