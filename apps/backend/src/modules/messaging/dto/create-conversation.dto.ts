import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ description: 'User ID of the partner you want to message' })
  @IsString()
  @IsNotEmpty()
  recipientUserId!: string;

  @ApiPropertyOptional({ description: 'Optional initial message content' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  initialMessage?: string;

  @ApiPropertyOptional({ description: 'URL or base64 data of uploaded attachment' })
  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @ApiPropertyOptional({ description: 'Name of attached file' })
  @IsString()
  @IsOptional()
  attachmentName?: string;
}
