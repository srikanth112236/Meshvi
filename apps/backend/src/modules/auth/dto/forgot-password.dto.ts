import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'srikanth@vedasynk.local' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
