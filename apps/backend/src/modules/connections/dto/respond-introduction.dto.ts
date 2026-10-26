import { IsNotEmpty, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum IntroductionAction {
  INTERMEDIARY_ACCEPT = 'INTERMEDIARY_ACCEPT',
  INTERMEDIARY_REJECT = 'INTERMEDIARY_REJECT',
  TARGET_ACCEPT = 'TARGET_ACCEPT',
  TARGET_DECLINE = 'TARGET_DECLINE',
}

export class RespondIntroductionDto {
  @ApiProperty({ enum: IntroductionAction, description: 'Action taking on the introduction' })
  @IsEnum(IntroductionAction)
  @IsNotEmpty()
  action!: IntroductionAction;

  @ApiPropertyOptional({ description: 'Optional attested endorsement note from intermediary' })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  endorsementNote?: string;
}
