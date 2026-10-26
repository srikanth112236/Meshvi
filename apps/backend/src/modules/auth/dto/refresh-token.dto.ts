import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Valid refresh token string' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({
    description: 'Optional target portal scope for new access token',
    required: false,
    enum: ['CONSUMER', 'COMPANY_ADMIN', 'SUPER_ADMIN'],
  })
  @IsString()
  @IsOptional()
  targetPortal?: 'CONSUMER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN';
}
