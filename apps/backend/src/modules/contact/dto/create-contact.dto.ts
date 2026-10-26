import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'Srikanth M' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'srikanth@vedasynk.local' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: 'Vedasynk Technologies' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  company?: string;

  @ApiProperty({ example: 'General Inquiry' })
  @IsString()
  @IsNotEmpty()
  enquiryType: string;

  @ApiProperty({ example: 'Looking to partner with beverage companies in SE Asia.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  consent: boolean;
}
