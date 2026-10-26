import { IsNotEmpty, IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMilestoneDto {
  @ApiProperty()
  @IsString() @IsNotEmpty() @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsDateString() @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  assignedTo?: string;
}
