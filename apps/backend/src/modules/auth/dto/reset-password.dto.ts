import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'srikanth@vedasynk.local' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code sent to user email' })
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ example: 'NewSecretPass2026!', minLength: 8 })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
