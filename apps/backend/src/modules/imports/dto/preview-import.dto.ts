import { IsNotEmpty, IsString, IsIn, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PreviewImportDto {
  @ApiProperty({ example: 'COMPANIES', description: 'COMPANIES or PROFESSIONALS' })
  @IsString()
  @IsIn(['COMPANIES', 'PROFESSIONALS'])
  importType: 'COMPANIES' | 'PROFESSIONALS';

  @ApiProperty({ example: 'companies_batch_1.csv' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 'name,domain,industry,headquarters_country\nBeverage Co,beverage.com,FMCG,MY' })
  @IsString()
  @IsNotEmpty()
  csvContent: string;
}

export class ExecuteImportDto {
  @ApiProperty({ example: 'job-id-uuid' })
  @IsString()
  @IsNotEmpty()
  jobId: string;
}
