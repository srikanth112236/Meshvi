import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewModeratorGuard } from './guards/review-moderator.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewModeratorGuard],
  exports: [ReviewsService],
})
export class ReviewsModule {}
