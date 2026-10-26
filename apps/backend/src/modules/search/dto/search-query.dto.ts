import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchQueryDto {
  @ApiPropertyOptional({ example: 'airport lounge beverage partnerships in Malaysia' })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ example: 'Commercial & Partnerships' })
  @IsString()
  @IsOptional()
  function?: string;

  @ApiPropertyOptional({ example: 'Consumer Goods & FMCG' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ example: 'MY' })
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiPropertyOptional({ example: 'Director' })
  @IsString()
  @IsOptional()
  seniority?: string;

  @ApiPropertyOptional({ example: 'staffing, recruiter, agency' })
  @IsString()
  @IsOptional()
  excludeKeywords?: string;

  @ApiPropertyOptional({ example: 'Consulting, Recruitment' })
  @IsString()
  @IsOptional()
  excludeIndustries?: string;

  @ApiPropertyOptional({ example: 'Apex Pacific Distribution' })
  @IsString()
  @IsOptional()
  excludeCompanies?: string;

  @ApiPropertyOptional({ example: 'CN, RU' })
  @IsString()
  @IsOptional()
  excludeCountries?: string;

  @ApiPropertyOptional({ example: 'true' })
  @IsString()
  @IsOptional()
  verifiedOnly?: string;

  @ApiPropertyOptional({ example: 'JAKIM_HALAL' })
  @IsString()
  @IsOptional()
  certification?: string;

  @ApiPropertyOptional({ example: 'MY-SG' })
  @IsString()
  @IsOptional()
  corridor?: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent-holding' })
  @IsString()
  @IsOptional()
  holdingCompanyId?: string;

  @ApiPropertyOptional({ example: 'true' })
  @IsString()
  @IsOptional()
  includeBranches?: string;

  @ApiPropertyOptional({ example: 70 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  minFitScore?: number;

  @ApiPropertyOptional({ example: 'ALL', enum: ['ALL', 'BEST', 'STRONG', 'DIRECTORY'] })
  @IsString()
  @IsOptional()
  matchTier?: 'ALL' | 'BEST' | 'STRONG' | 'DIRECTORY';

  @ApiPropertyOptional({ example: 'ALL', enum: ['ALL', 'TARGET_CITY', 'OTHER_CITIES'] })
  @IsString()
  @IsOptional()
  locationScope?: 'ALL' | 'TARGET_CITY' | 'OTHER_CITIES';

  @ApiPropertyOptional({
    example: 'BALANCED',
    enum: ['BALANCED', 'ROLE_FIRST', 'COMPANY_FIRST', 'GOAL_FIRST', 'COMPLIANCE_FIRST'],
  })
  @IsString()
  @IsOptional()
  searchPriority?: 'BALANCED' | 'ROLE_FIRST' | 'COMPANY_FIRST' | 'GOAL_FIRST' | 'COMPLIANCE_FIRST';

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 50 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;
}
