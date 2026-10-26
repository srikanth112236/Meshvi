import { IsOptional, IsString, IsBoolean, MaxLength, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DealRoomStatus, DealOutcomeType } from '@prisma/client';

export class UpdateDealRoomDto {
  @ApiPropertyOptional({ maxLength: 500 })
  @IsString() @IsOptional() @MaxLength(500)
  initiatorGoal?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsString() @IsOptional() @MaxLength(500)
  partnerGoal?: string;

  @ApiPropertyOptional({ enum: DealRoomStatus })
  @IsEnum(DealRoomStatus) @IsOptional()
  status?: DealRoomStatus;

  @ApiPropertyOptional()
  @IsBoolean() @IsOptional()
  ndaRequired?: boolean;

  @ApiPropertyOptional({ enum: DealOutcomeType })
  @IsEnum(DealOutcomeType) @IsOptional()
  closedOutcome?: DealOutcomeType;
}
