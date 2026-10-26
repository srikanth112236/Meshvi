import { IsNotEmpty, IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConnectionResponseAction {
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE',
}

export class RespondConnectionDto {
  @ApiProperty({ enum: ConnectionResponseAction, description: 'Accept or decline connection' })
  @IsEnum(ConnectionResponseAction)
  @IsNotEmpty()
  action!: ConnectionResponseAction;

  @ApiPropertyOptional({ example: 'NOT_A_FIT', description: 'Taxonomy reason code for declining' })
  @IsString()
  @IsOptional()
  declineReasonCode?: string;

  @ApiPropertyOptional({ example: 'Not aligned with current Q4 corporate objectives' })
  @IsString()
  @IsOptional()
  declineNote?: string;
}
