import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Apex Pacific Distribution' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: 'Apex Pacific Distribution Pte Ltd' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  legalName?: string;

  @ApiPropertyOptional({ example: 'apexpacific.com' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  domain?: string;

  @ApiPropertyOptional({ example: 'https://apexpacific.com' })
  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'Leading regional distribution and supply chain operator in Southeast Asia.' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'Privately Held' })
  @IsString()
  @IsOptional()
  companyType?: string;

  @ApiPropertyOptional({ example: 'Logistics & Supply Chain' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ example: 'Beverage & Consumer Packaged Goods' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  subIndustry?: string;

  @ApiPropertyOptional({ example: 'Kuala Lumpur' })
  @IsString()
  @IsOptional()
  headquartersCity?: string;

  @ApiPropertyOptional({ example: 'MY' })
  @IsString()
  @IsOptional()
  headquartersCountry?: string;
}
