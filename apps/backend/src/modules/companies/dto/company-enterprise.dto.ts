import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCompanyDomainDto {
  @ApiProperty({ example: 'apexpacific.co.uk' })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class AddCompanyRelationshipDto {
  @ApiProperty({ example: 'uuid-of-subsidiary-company' })
  @IsString()
  @IsNotEmpty()
  subsidiaryId: string;

  @ApiPropertyOptional({ example: 'SUBSIDIARY', enum: ['SUBSIDIARY', 'DIVISION', 'REGIONAL_HQ', 'HOLDING'] })
  @IsString()
  @IsOptional()
  relationshipType?: string;

  @ApiPropertyOptional({ example: 1.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  confidenceScore?: number;

  @ApiPropertyOptional({ example: 'ADMIN_VERIFIED' })
  @IsString()
  @IsOptional()
  source?: string;
}

export class MergeCompanyReviewDto {
  @ApiProperty({ example: 'uuid-of-target-primary-company' })
  @IsString()
  @IsNotEmpty()
  targetCompanyId: string;

  @ApiProperty({ example: 'uuid-of-duplicate-source-company' })
  @IsString()
  @IsNotEmpty()
  sourceCompanyId: string;

  @ApiPropertyOptional({ example: 'Duplicate entity registered under alternate name' })
  @IsString()
  @IsOptional()
  reviewNotes?: string;
}

export class UpdateTeamCapacityDto {
  @ApiProperty({ example: 'uuid-of-target-member' })
  @IsString()
  @IsNotEmpty()
  memberUserId: string;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(1)
  @Max(100)
  maxOpenBridges: number;

  @ApiPropertyOptional({ example: 'Sales' })
  @IsString()
  @IsOptional()
  department?: string;
}

export class DepartmentRoutingRuleDto {
  @ApiProperty({ example: 'Sales' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiPropertyOptional({ example: 'RFP' })
  @IsString()
  @IsOptional()
  categoryTag?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({ example: 'uuid-of-target-lead-user' })
  @IsString()
  @IsOptional()
  targetUserId?: string;
}
