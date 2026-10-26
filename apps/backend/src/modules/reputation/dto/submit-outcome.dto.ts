import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DealOutcomeType } from '@prisma/client';

export class SubmitOutcomeDto {
  @ApiProperty({ enum: DealOutcomeType })
  @IsEnum(DealOutcomeType)
  outcomeType!: DealOutcomeType;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  partnershipCategory?: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  geographyTag?: string;

  @ApiPropertyOptional()
  @IsNumber() @IsOptional()
  dealValue?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5, description: 'Rating for the other party (1-5)' })
  @IsInt() @IsOptional() @Min(1) @Max(5)
  ratingForOtherParty?: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsString() @IsOptional()
  feedback?: string;
}
