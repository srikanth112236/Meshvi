import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { DealOutcomeType } from '@prisma/client';

export class RecordOutcomeDto {
  @IsEnum(DealOutcomeType)
  outcomeType: DealOutcomeType;

  @IsOptional()
  @IsString()
  partnershipCategory?: string;

  @IsOptional()
  @IsString()
  geographyTag?: string;

  @IsOptional()
  @IsNumber()
  dealValue?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
