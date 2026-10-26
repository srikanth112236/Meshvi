import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIntroductionDto {
  @ApiProperty({ description: 'ID of the target ProfessionalProfile you wish to be introduced to' })
  @IsString()
  @IsNotEmpty()
  targetProfileId!: string;

  @ApiProperty({ description: 'User ID of the intermediary mutual connection facilitating the introduction' })
  @IsString()
  @IsNotEmpty()
  intermediaryUserId!: string;

  @ApiProperty({ description: 'Professional context explaining why an introduction makes sense for both parties' })
  @IsString()
  @IsNotEmpty()
  @MinLength(15, { message: 'Introduction reason must be at least 15 characters long' })
  @MaxLength(1000)
  businessReason!: string;
}
