import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReviewModeratorGuard } from './guards/review-moderator.guard';

@ApiTags('Member Reviews & Application Feedback')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('public')
  @ApiOperation({ summary: 'Published MESHVI ratings and member feedback (public wall)' })
  async getPublicReviews() {
    return this.reviewsService.getPublicReviews();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Read the signed-in member's own review" })
  async getMyReview(@CurrentUser('id') userId: string) {
    return this.reviewsService.getMyReview(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit a rating and feedback for the MESHVI application' })
  async submitReview(@CurrentUser('id') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.submitReview(userId, dto);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update your rating and feedback (returns to moderation queue)' })
  async updateMyReview(@CurrentUser('id') userId: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.updateMyReview(userId, dto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove your review' })
  async deleteMyReview(@CurrentUser('id') userId: string) {
    return this.reviewsService.deleteMyReview(userId);
  }

  @Get('moderation')
  @UseGuards(JwtAuthGuard, ReviewModeratorGuard)
  @ApiOperation({ summary: 'Moderation queue (allow-listed emails and Super Admins only)' })
  async getModerationQueue(
    @Query('status') statusQuery?: string,
    @Query('q') search?: string,
  ) {
    const status =
      statusQuery && Object.values(ReviewStatus).includes(statusQuery as ReviewStatus)
        ? (statusQuery as ReviewStatus)
        : undefined;
    return this.reviewsService.getModerationQueue(status, search);
  }

  @Patch('moderation/:id')
  @UseGuards(JwtAuthGuard, ReviewModeratorGuard)
  @ApiOperation({ summary: 'Publish, hide, reply to, or otherwise moderate a review' })
  async moderateReview(
    @CurrentUser() moderator: any,
    @Param('id') id: string,
    @Body() dto: ModerateReviewDto,
  ) {
    return this.reviewsService.moderateReview(id, dto, moderator);
  }

  @Delete('moderation/:id')
  @UseGuards(JwtAuthGuard, ReviewModeratorGuard)
  @ApiOperation({ summary: 'Permanently delete a review' })
  async deleteReview(@CurrentUser() moderator: any, @Param('id') id: string) {
    return this.reviewsService.deleteReview(id, moderator);
  }
}
