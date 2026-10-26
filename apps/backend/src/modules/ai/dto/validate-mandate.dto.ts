import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateMandateDto {
  @ApiProperty({
    example: 'Seeking Joint Venture Supplier for Regional Aviation Concessions',
    description: 'Title of the partnership proposal',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Outline your bilateral objective, target counterparty credentials, volume requirements, or co-investment scope...',
    description: 'Body of the partnership mandate and bilateral requirements',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: ['partnership', 'jointventure', 'coldchain'],
    description: 'Associated hashtags or sectors',
  })
  @IsArray()
  @IsOptional()
  tags?: string[];
}
