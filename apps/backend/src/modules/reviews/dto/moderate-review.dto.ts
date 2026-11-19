import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

export class ModerateReviewDto {
  @ApiPropertyOptional({ enum: ReviewStatus })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiPropertyOptional({
    description: 'Official MESHVI response shown publicly beneath the review. Send an empty string to clear it.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminReply?: string;
}
