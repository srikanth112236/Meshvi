import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Srikanth M' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'srikanth@vedasynk.local' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+91 98765 43210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'Director of Procurement' })
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiProperty({ example: 'Borneo Agro Beverages' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: 'srikanth@borneoagro.my', required: false })
  @IsEmail()
  @IsOptional()
  companyEmail?: string;

  @ApiProperty({ example: 'borneoagro.my', required: false })
  @IsString()
  @IsOptional()
  companyDomain?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  agreeTerms: boolean;

  @ApiProperty({ example: 'INDIVIDUAL', required: false })
  @IsString()
  @IsOptional()
  track?: 'COMPANY' | 'INDIVIDUAL';
}

export class VerifyRegistrationOtpDto {
  @ApiProperty({ example: 'name@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

