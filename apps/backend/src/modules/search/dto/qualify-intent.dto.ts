import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QualifyIntentDto {
  @ApiProperty({
    example: 'airport lounge beverage partnerships in Malaysia',
    description: 'Original unstructured commercial query',
  })
  @IsString()
  @IsNotEmpty()
  rawQuery: string;

  @ApiPropertyOptional({
    example: 'Premium Ready-to-Drink (RTD) Organic Teas & Sparkling Botanicals',
    description: 'Specific category posture of the offering product/service',
  })
  @IsString()
  @IsOptional()
  productCategory?: string;

  @ApiPropertyOptional({
    example: 'Halal JAKIM Certified & HACCP / ISO 22000 Food Safety',
    description: 'Required regulatory/compliance certification tier',
  })
  @IsString()
  @IsOptional()
  certificationTier?: string;

  @ApiPropertyOptional({
    example: 'Tier-1 International Departure Transit Lounges (KLIA 1 & KLIA 2)',
    description: 'Target airport or facility tier',
  })
  @IsString()
  @IsOptional()
  targetFacility?: string;

  @ApiPropertyOptional({
    example: 'Direct Concession Brand Partnership & On-Menu Distribution',
    description: 'Target commercial route / concession model',
  })
  @IsString()
  @IsOptional()
  engagementType?: string;
}
