import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SmartDraftDto {
  @ApiProperty({ description: 'Target recipient professional profile ID' })
  @IsString()
  @IsNotEmpty()
  recipientProfileId!: string;

  @ApiPropertyOptional({ description: 'Optional intent category, e.g. Distribution, Technology, Sourcing' })
  @IsString()
  @IsOptional()
  templateType?: string;

  @ApiPropertyOptional({ description: 'Optional custom strategic objective' })
  @IsString()
  @IsOptional()
  customObjective?: string;

  @ApiPropertyOptional({ description: 'Optional mutual goals description' })
  @IsString()
  @IsOptional()
  mutualGoals?: string;
}

export class LintNoteDto {
  @ApiProperty({ description: 'Proposed connection message note to scan for spam phrasing and length' })
  @IsString()
  @IsNotEmpty()
  note!: string;
}

export class ClarifyConnectionDto {
  @ApiProperty({ description: 'Clarifying question for the requester before accepting or declining' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Clarification question must be at least 5 characters' })
  @MaxLength(500, { message: 'Clarification question cannot exceed 500 characters' })
  question!: string;
}

export class AnswerClarificationDto {
  @ApiProperty({ description: 'Answer to recipient clarifying question' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Clarification answer must be at least 5 characters' })
  @MaxLength(600, { message: 'Clarification answer cannot exceed 600 characters' })
  answer!: string;
}

export class RemindConnectionDto {
  @ApiPropertyOptional({ description: 'Optional gentle note to accompany reminder' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  reminderNote?: string;
}
