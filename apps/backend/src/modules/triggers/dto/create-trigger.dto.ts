import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, Min, Max, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TriggerType } from '@prisma/client';

export class CreateTriggerDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ enum: TriggerType })
  @IsEnum(TriggerType)
  triggerType!: TriggerType;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  headline!: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  body?: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  sourceUrl?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 1 })
  @IsNumber() @IsOptional() @Min(0) @Max(1)
  relevanceScore?: number;
}
