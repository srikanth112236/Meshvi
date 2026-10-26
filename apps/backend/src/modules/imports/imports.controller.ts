import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ImportsService } from './imports.service';
import { PreviewImportDto, ExecuteImportDto } from './dto/preview-import.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Data Import & Provenance')
@Controller('imports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.SUPER_ADMIN)
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Get('template')
  @ApiOperation({ summary: 'Get standard CSV template format for companies or professionals' })
  getTemplate(@Query('type') type: 'COMPANIES' | 'PROFESSIONALS') {
    return this.importsService.getTemplate(type || 'COMPANIES');
  }

  @Post('preview')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dry-run validation and row-level preview of CSV payload' })
  @ApiResponse({ status: 200, description: 'Dry run completed with error report' })
  async preview(
    @CurrentUser() user: any,
    @Body() dto: PreviewImportDto,
  ) {
    return this.importsService.previewImport(user.id, dto);
  }

  @Post('execute')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute batch import of valid rows from a preview job' })
  @ApiResponse({ status: 200, description: 'Batch import executed' })
  async execute(
    @CurrentUser() user: any,
    @Body() dto: ExecuteImportDto,
  ) {
    return this.importsService.executeImport(user.id, dto.jobId);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List recent import jobs and provenance records' })
  async listJobs() {
    return this.importsService.listJobs();
  }

  @Get(':id/errors')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get granular row-level errors for an import job' })
  async getJobErrors(@Param('id') jobId: string) {
    return this.importsService.getJobErrors(jobId);
  }
}
