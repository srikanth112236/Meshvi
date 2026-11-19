import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewCategory } from '@prisma/client';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: 'Overall application rating' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ enum: ReviewCategory, example: ReviewCategory.GENERAL })
  @IsOptional()
  @IsEnum(ReviewCategory)
  category?: ReviewCategory;

  @ApiPropertyOptional({ example: 'A sharper way to discover partners' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiProperty({ example: 'The intent-based search saved our team hours of manual research.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({ example: false, description: 'Publish my feedback without my name' })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
