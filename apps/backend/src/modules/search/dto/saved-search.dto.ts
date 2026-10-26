import { IsNotEmpty, IsOptional, IsString, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSavedSearchDto {
  @ApiProperty({ example: 'Airport Beverage Procurement Leads' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'beverage distribution' })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({ example: { function: 'Procurement', countryCode: 'MY' } })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ example: 'DAILY', enum: ['INSTANT', 'DAILY', 'WEEKLY', 'OFF'] })
  @IsString()
  @IsOptional()
  alertFrequency?: string;
}
