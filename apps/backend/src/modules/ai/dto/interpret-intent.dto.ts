import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InterpretIntentDto {
  @ApiProperty({ example: 'Looking for airport lounge beverage contacts in Malaysia' })
  @IsString()
  @IsNotEmpty()
  query: string;
}
