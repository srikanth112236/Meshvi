import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConnectionDto {
  @ApiProperty({ description: 'ID of the primary recipient ProfessionalProfile' })
  @IsString()
  @IsNotEmpty()
  recipientProfileId!: string;

  @ApiProperty({ description: 'Specific, professional reason for requesting connection (no spam)', example: 'Exploring partnership in beverage distribution for Southeast Asian airports' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Business reason must be at least 10 characters long to maintain connection quality' })
  @MaxLength(1000)
  businessReason!: string;

  @ApiPropertyOptional({ description: 'Feature #24: Multi-Recipient ABM committee profile IDs for enterprise bridges', type: [String] })
  @IsArray()
  @IsOptional()
  recipientProfileIds?: string[];

  @ApiPropertyOptional({ description: 'Proposal opportunity pitch body' })
  @IsString()
  @IsOptional()
  opportunityPitch?: string;

  @ApiPropertyOptional({ description: 'Mutual strategic goals & alignment tags' })
  @IsString()
  @IsOptional()
  mutualGoals?: string;

  @ApiPropertyOptional({ description: 'Optional 60-second audio memo voice brief base64 URI' })
  @IsString()
  @IsOptional()
  voiceMemoUrl?: string;

  @ApiPropertyOptional({ description: 'Duration of recorded audio memo in seconds' })
  @IsOptional()
  voiceMemoDurationSec?: number;

  @ApiPropertyOptional({ description: 'Pre-Meeting Mutual Agenda Contract deliverable items', type: [String] })
  @IsArray()
  @IsOptional()
  agendaDeliverables?: string[];
}
