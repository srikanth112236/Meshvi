import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OpportunityOwnerType, OpportunityStatus, OpportunityVisibility } from '@prisma/client';

export class OpportunitySeekingDto {
  @ApiPropertyOptional({ description: 'Array of commercial objectives e.g. ["distribution_partnership", "supplier_intake"]' })
  @IsArray()
  @IsOptional()
  objectives?: string[];

  @ApiPropertyOptional({ description: 'Array of partner types e.g. ["airport_concessionaire", "supermarket_chain"]' })
  @IsArray()
  @IsOptional()
  partnerTypes?: string[];

  @ApiPropertyOptional({ description: 'Target industries e.g. ["beverages", "hospitality"]' })
  @IsArray()
  @IsOptional()
  industries?: string[];

  @ApiPropertyOptional({ description: 'Target geographies e.g. ["SG", "MY", "TH"]' })
  @IsArray()
  @IsOptional()
  geographies?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class OpportunityOfferingDto {
  @ApiPropertyOptional({ description: 'Array of capabilities e.g. ["hospitality_distribution", "cold_chain_logistics"]' })
  @IsArray()
  @IsOptional()
  capabilities?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  productsServices?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(300)
  marketAccess?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  geographies?: string[];
}

export class CreateOpportunityDto {
  @ApiProperty({ enum: OpportunityOwnerType })
  @IsEnum(OpportunityOwnerType)
  ownerType!: OpportunityOwnerType;

  @ApiPropertyOptional({ description: 'Company ID if ownerType is COMPANY' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiProperty({ description: 'Title of the opportunity' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ description: '1-2 sentence overview' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary?: string;

  @ApiPropertyOptional({ enum: OpportunityStatus })
  @IsEnum(OpportunityStatus)
  @IsOptional()
  status?: OpportunityStatus;

  @ApiPropertyOptional({ enum: OpportunityVisibility })
  @IsEnum(OpportunityVisibility)
  @IsOptional()
  visibility?: OpportunityVisibility;

  @ApiPropertyOptional({ description: 'MANUAL or AUTOMATIC approval' })
  @IsString()
  @IsOptional()
  approvalMode?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  targetIndustries?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  targetMarkets?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  partnerTypes?: string[];

  @ApiPropertyOptional({ type: OpportunitySeekingDto })
  @IsOptional()
  seeking?: OpportunitySeekingDto;

  @ApiPropertyOptional({ type: OpportunityOfferingDto })
  @IsOptional()
  offering?: OpportunityOfferingDto;
}
