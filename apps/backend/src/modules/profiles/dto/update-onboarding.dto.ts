import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileVisibility } from '@prisma/client';

export class ExperienceItemDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  professionalProfileId?: string;

  @IsOptional()
  createdAt?: any;

  @IsOptional()
  updatedAt?: any;

  @IsString()
  companyName: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  function?: string;

  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}

export class IntentItemDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  professionalProfileId?: string;

  @IsOptional()
  createdAt?: any;

  @IsOptional()
  updatedAt?: any;

  @IsString()
  intentType: string; // 'LOOKING_FOR' or 'OFFERING'

  @IsString()
  description: string;
}

export class UpdateOnboardingDto {
  // Step 2: Identity & Basics
  @ApiPropertyOptional({ example: 'Srikanth M' })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({ example: 'Head of Partnerships & Business Alliances' })
  @IsString()
  @IsOptional()
  headline?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/username' })
  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @ApiPropertyOptional({ example: '10+ years driving commercial partnerships across FMCG and travel retail.' })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({ example: 'Commercial Director' })
  @IsString()
  @IsOptional()
  currentTitle?: string;

  @ApiPropertyOptional({ example: 'Vedasynk Technologies' })
  @IsString()
  @IsOptional()
  currentCompanyName?: string;

  @ApiPropertyOptional({ example: 'uuid-company-id' })
  @IsString()
  @IsOptional()
  currentCompanyId?: string;

  @ApiPropertyOptional({ example: 'Partnerships & BD' })
  @IsString()
  @IsOptional()
  function?: string;

  @ApiPropertyOptional({ example: 'Director' })
  @IsString()
  @IsOptional()
  seniority?: string;

  @ApiPropertyOptional({ example: 'Consumer Goods & Retail' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ example: 'Kuala Lumpur' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'MY' })
  @IsString()
  @IsOptional()
  countryCode?: string;

  // Step 3: Experience & Expertise
  @ApiPropertyOptional({ type: [ExperienceItemDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExperienceItemDto)
  experiences?: ExperienceItemDto[];

  @ApiPropertyOptional({ example: ['Travel Retail', 'Airport Lounges', 'Commercial Contracts'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  expertiseTerms?: string[];

  // Step 4: Intent
  @ApiPropertyOptional({ type: [IntentItemDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => IntentItemDto)
  intents?: IntentItemDto[];

  // Step 5: Visibility
  @ApiPropertyOptional({ enum: ProfileVisibility, example: 'SIGNED_IN_ONLY' })
  @IsEnum(ProfileVisibility)
  @IsOptional()
  visibility?: ProfileVisibility;

  // Step & Department convenience fields
  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  step?: number;

  @ApiPropertyOptional({ example: 'Commercial Partnerships & Alliances' })
  @IsString()
  @IsOptional()
  department?: string;

  // Step 6: Completion flag
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  // Executive Firewall & Reception Protocols
  @ApiPropertyOptional({ example: ['No Cold Agency Pitches'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  firewallRules?: string[];

  @ApiPropertyOptional({ example: ['DEAL_ROOM', 'SCHEDULED_CALL'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  receptionProtocols?: string[];
}
