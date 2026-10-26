import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReadinessStatus } from '@prisma/client';

export class UpsertReadinessDto {
  @ApiPropertyOptional({ enum: ReadinessStatus })
  @IsEnum(ReadinessStatus)
  @IsOptional()
  status?: ReadinessStatus;

  @ApiPropertyOptional({ description: 'JSON array of sector tags e.g. ["FMCG","Aviation"]' })
  @IsString()
  @IsOptional()
  activeSectors?: string;

  @ApiPropertyOptional({ description: 'JSON array of geo codes e.g. ["MY","SG","ASEAN"]' })
  @IsString()
  @IsOptional()
  activeGeographies?: string;

  @ApiPropertyOptional({ description: 'JSON array e.g. ["DISTRIBUTION","SUPPLIER","JOINT_VENTURE"]' })
  @IsString()
  @IsOptional()
  partnershipTypes?: string;

  @ApiPropertyOptional({ description: 'JSON array of things NOT wanted' })
  @IsString()
  @IsOptional()
  notLookingFor?: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  openMessage?: string;
}
