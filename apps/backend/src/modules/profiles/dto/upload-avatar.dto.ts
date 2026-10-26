import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarDto {
  @ApiProperty({ description: 'Base64 image data URL (e.g. data:image/png;base64,...)' })
  @IsString()
  @IsNotEmpty()
  dataUrl: string;

  @ApiProperty({ description: 'Original file name', required: false })
  @IsString()
  @IsOptional()
  fileName?: string;
}
