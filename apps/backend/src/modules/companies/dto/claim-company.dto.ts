import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClaimCompanyDto {
  @ApiProperty({ example: 'DOMAIN_EMAIL', description: 'DOMAIN_EMAIL, DOCUMENT, or MANUAL' })
  @IsString()
  @IsNotEmpty()
  verificationMethod: string;

  @ApiPropertyOptional({ example: 'Authorized business director registered with official corporate domain email' })
  @IsString()
  @IsOptional()
  evidenceReference?: string;
}
