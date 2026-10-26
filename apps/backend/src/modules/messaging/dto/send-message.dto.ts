import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'Message body content' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body!: string;

  @ApiPropertyOptional({ description: 'Message type: TEXT, PROPOSAL, MEETING_INVITE' })
  @IsString()
  @IsOptional()
  messageType?: string;

  @ApiPropertyOptional({ description: 'URL or path to uploaded proposal attachment' })
  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @ApiPropertyOptional({ description: 'Name of the attached proposal or pitch deck' })
  @IsString()
  @IsOptional()
  attachmentName?: string;

  @ApiPropertyOptional({ description: 'Meeting invite payload JSON string' })
  @IsString()
  @IsOptional()
  meetingPayloadJson?: string;

  @ApiPropertyOptional({ description: 'Quoted message reply info or media metadata JSON' })
  @IsString()
  @IsOptional()
  metadataJson?: string;
}
