import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PreviewImportDto } from './dto/preview-import.dto';

export interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
  isValid: boolean;
  errors: Array<{ field: string; code: string; message: string }>;
}

@Injectable()
export class ImportsService {
  private readonly logger = new Logger(ImportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private sanitizeCell(val: string): string {
    if (!val) return '';
    let clean = val.trim();
    // Formula-injection protection
    if (['=', '+', '-', '@'].includes(clean[0])) {
      clean = clean.substring(1).trim();
    }
    return clean;
  }

  private parseCsv(content: string): { headers: string[]; rows: string[][] } {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      throw new BadRequestException('CSV content is empty.');
    }

    const headers = lines[0].split(',').map((h) => this.sanitizeCell(h).toLowerCase());
    const rows = lines.slice(1).map((line) => line.split(',').map((c) => this.sanitizeCell(c)));

    return { headers, rows };
  }

  getTemplate(type: 'COMPANIES' | 'PROFESSIONALS') {
    if (type === 'COMPANIES') {
      return {
        headers: ['name', 'domain', 'legal_name', 'industry', 'headquarters_city', 'headquarters_country', 'description'],
        sampleCsv:
          'name,domain,legal_name,industry,headquarters_city,headquarters_country,description\n' +
          'Borneo Agro Beverages,borneoagro.my,Borneo Agro Beverages Sdn Bhd,FMCG & Bottling,Kuala Lumpur,MY,"Specialty agricultural beverage manufacturing and regional export packaging."\n' +
          'Nexus Cloud Systems,nexuscloud.jp,Nexus Cloud Systems KK,Enterprise Software,Tokyo,JP,"Cloud infrastructure and enterprise ERP software systems."\n',
      };
    } else {
      return {
        headers: ['display_name', 'current_title', 'company_name', 'function', 'industry', 'city', 'country_code', 'headline', 'expertise'],
        sampleCsv:
          'display_name,current_title,company_name,function,industry,city,country_code,headline,expertise\n' +
          'Priya Sharma,Director of Supply Chain,Apex Pacific Distribution,Supply Chain & Procurement,Logistics,Singapore,SG,"Leading regional cold-chain and logistics sourcing","Procurement; Cold Chain; Logistics"\n' +
          'Kenji Sato,Head of Cloud Alliances,Nexus Cloud Systems,Commercial & Partnerships,Enterprise Software,Tokyo,JP,"Managing reseller ecosystem in APAC","Cloud; SaaS; Partnerships"\n',
      };
    }
  }

  async previewImport(userId: string, dto: PreviewImportDto) {
    const { headers, rows } = this.parseCsv(dto.csvContent);

    // Validate required headers
    const requiredCompanyHeaders = ['name', 'industry', 'headquarters_country'];
    const requiredProfessionalHeaders = ['display_name', 'current_title', 'function', 'country_code'];

    const required = dto.importType === 'COMPANIES' ? requiredCompanyHeaders : requiredProfessionalHeaders;
    const missing = required.filter((r) => !headers.includes(r));

    if (missing.length > 0) {
      throw new BadRequestException(`Missing required CSV header columns: ${missing.join(', ')}`);
    }

    // Ensure default DataSource exists
    let dataSource = await this.prisma.dataSource.findFirst({
      where: { providerKey: 'CONTROLLED_CSV_IMPORT' },
    });
    if (!dataSource) {
      dataSource = await this.prisma.dataSource.create({
        data: {
          name: 'Superadmin Controlled CSV Import',
          sourceType: 'CSV_IMPORT',
          providerKey: 'CONTROLLED_CSV_IMPORT',
          permittedUsage: 'PERMITTED_FOR_DIRECTORY_SEARCH',
        },
      });
    }

    const parsedRows: ParsedRow[] = [];
    const importErrors: Array<{ rowNumber: number; field: string; code: string; message: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      const rowNum = i + 2; // +1 for header, +1 for 1-based index
      const rowObj: Record<string, string> = {};

      headers.forEach((h, idx) => {
        rowObj[h] = rawRow[idx] || '';
      });

      const errors: Array<{ field: string; code: string; message: string }> = [];

      if (dto.importType === 'COMPANIES') {
        if (!rowObj['name']) {
          errors.push({ field: 'name', code: 'REQUIRED_FIELD_MISSING', message: 'Company name is required.' });
        }
        if (!rowObj['headquarters_country'] || rowObj['headquarters_country'].length !== 2) {
          errors.push({ field: 'headquarters_country', code: 'INVALID_COUNTRY_CODE', message: 'Country must be a 2-letter ISO code.' });
        }
      } else {
        if (!rowObj['display_name']) {
          errors.push({ field: 'display_name', code: 'REQUIRED_FIELD_MISSING', message: 'Display name is required.' });
        }
        if (!rowObj['current_title']) {
          errors.push({ field: 'current_title', code: 'REQUIRED_FIELD_MISSING', message: 'Current title is required.' });
        }
        if (!rowObj['country_code'] || rowObj['country_code'].length !== 2) {
          errors.push({ field: 'country_code', code: 'INVALID_COUNTRY_CODE', message: 'Country code must be 2 letters.' });
        }
      }

      parsedRows.push({
        rowNumber: rowNum,
        data: rowObj,
        isValid: errors.length === 0,
        errors,
      });

      errors.forEach((e) => {
        importErrors.push({ rowNumber: rowNum, ...e });
      });
    }

    const totalRows = parsedRows.length;
    const validRows = parsedRows.filter((r) => r.isValid).length;
    const invalidRows = totalRows - validRows;

    // Create DataImportJob record
    const job = await this.prisma.dataImportJob.create({
      data: {
        dataSourceId: dataSource.id,
        initiatedByUserId: userId,
        importType: dto.importType,
        fileName: dto.fileName,
        status: 'PREVIEW_READY',
        totalRows,
        validRows,
        invalidRows,
        importedRows: 0,
        failedRows: 0,
      },
    });

    // Store row errors
    for (const err of importErrors) {
      await this.prisma.dataImportError.create({
        data: {
          importJobId: job.id,
          rowNumber: err.rowNumber,
          fieldName: err.field,
          errorCode: err.code,
          safeMessage: err.message,
        },
      });
    }

    // Temporarily cache valid rows in audit log or job metadata
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'IMPORT_PREVIEW_GENERATED',
        resource: 'DATA_IMPORT_JOB',
        resourceId: job.id,
        metadata: JSON.stringify({
          validRowsData: parsedRows.filter((r) => r.isValid).map((r) => r.data),
        }),
      },
    });

    return {
      jobId: job.id,
      importType: dto.importType,
      fileName: dto.fileName,
      totalRows,
      validRows,
      invalidRows,
      samplePreview: parsedRows.slice(0, 5),
      errorsPreview: importErrors.slice(0, 10),
    };
  }

  async executeImport(userId: string, jobId: string) {
    const job = await this.prisma.dataImportJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Import job not found.');
    }

    if (job.status !== 'PREVIEW_READY') {
      throw new BadRequestException(`Cannot execute job in status ${job.status}`);
    }

    // Retrieve cached rows from audit log
    const auditLog = await this.prisma.auditLog.findFirst({
      where: {
        action: 'IMPORT_PREVIEW_GENERATED',
        resourceId: jobId,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!auditLog || !auditLog.metadata) {
      throw new BadRequestException('Import payload not found or expired.');
    }

    const { validRowsData } = JSON.parse(auditLog.metadata);
    let imported = 0;
    let failed = 0;

    await this.prisma.dataImportJob.update({
      where: { id: jobId },
      data: { status: 'IMPORTING', startedAt: new Date() },
    });

    for (const row of validRowsData) {
      try {
        if (job.importType === 'COMPANIES') {
          const normName = row['name'].trim().toLowerCase();
          const domain = row['domain'] ? row['domain'].trim().toLowerCase() : null;

          // Check if already exists
          const existing = await this.prisma.company.findFirst({
            where: { OR: [{ normalizedName: normName }, domain ? { domain } : { id: 'none' }] },
          });

          if (!existing) {
            await this.prisma.company.create({
              data: {
                name: row['name'].trim(),
                normalizedName: normName,
                legalName: row['legal_name'] || null,
                domain,
                industry: row['industry'] || 'General Business',
                headquartersCity: row['headquarters_city'] || null,
                headquartersCountry: (row['headquarters_country'] || 'US').toUpperCase(),
                description: row['description'] || null,
                verificationStatus: 'UNVERIFIED',
                isSeedData: false,
              },
            });
            imported++;
          }
        } else {
          // Import Professional
          const profile = await this.prisma.professionalProfile.create({
            data: {
              displayName: row['display_name'].trim(),
              currentTitle: row['current_title'].trim(),
              function: row['function'] || 'Business Development',
              industry: row['industry'] || 'Technology',
              city: row['city'] || null,
              countryCode: (row['country_code'] || 'US').toUpperCase(),
              headline: row['headline'] || null,
              visibility: 'PUBLIC',
              verificationStatus: 'UNVERIFIED',
              isSeedData: false,
            },
          });

          // Link expertise if provided
          if (row['expertise']) {
            const tags = row['expertise'].split(';').map((t: string) => t.trim());
            for (const t of tags) {
              if (t) {
                await this.prisma.professionalExpertise.create({
                  data: {
                    professionalProfileId: profile.id,
                    term: t,
                    normalizedTerm: t.toLowerCase(),
                  },
                });
              }
            }
          }

          // Link experience if company provided
          if (row['company_name']) {
            await this.prisma.professionalExperience.create({
              data: {
                professionalProfileId: profile.id,
                companyName: row['company_name'].trim(),
                title: row['current_title'].trim(),
                isCurrent: true,
              },
            });
          }

          imported++;
        }
      } catch (err: any) {
        failed++;
        this.logger.error(`Error importing row: ${err.message}`);
      }
    }

    const finalStatus = failed > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED';

    const updatedJob = await this.prisma.dataImportJob.update({
      where: { id: jobId },
      data: {
        status: finalStatus,
        importedRows: imported,
        failedRows: failed,
        completedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'IMPORT_EXECUTED',
        resource: 'DATA_IMPORT_JOB',
        resourceId: jobId,
        metadata: JSON.stringify({ imported, failed, finalStatus }),
      },
    });

    return {
      message: `Batch import executed successfully with status ${finalStatus}.`,
      job: updatedJob,
    };
  }

  async listJobs() {
    return this.prisma.dataImportJob.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        dataSource: true,
      },
      take: 20,
    });
  }

  async getJobErrors(jobId: string) {
    return this.prisma.dataImportError.findMany({
      where: { importJobId: jobId },
      orderBy: { rowNumber: 'asc' },
    });
  }
}
