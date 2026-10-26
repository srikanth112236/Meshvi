import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'srikanth@vedasynk.local' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'CONSUMER',
    required: false,
    enum: ['CONSUMER', 'COMPANY_ADMIN', 'SUPER_ADMIN'],
  })
  @IsString()
  targetPortal?: 'CONSUMER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN';
}
