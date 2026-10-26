import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClarifyRequestDto {
  @ApiPropertyOptional({ description: 'Clarification question asked by the recipient' })
  @IsString()
  @IsOptional()
  @MaxLength(600)
  question?: string;

  @ApiPropertyOptional({ description: 'Clarification answer provided by the sender' })
  @IsString()
  @IsOptional()
  @MaxLength(800)
  answer?: string;
}

export class DeclineRequestDto {
  @ApiPropertyOptional({ description: 'Optional reason for decline (kept confidential)' })
  @IsString()
  @IsOptional()
  @MaxLength(400)
  reason?: string;
}
