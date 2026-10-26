import { Test, TestingModule } from '@nestjs/testing';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';

describe('ImportsController', () => {
  let controller: ImportsController;

  const mockImportsService = {
    getTemplate: jest.fn().mockReturnValue({
      headers: ['name', 'industry', 'headquarters_country'],
      sampleCsv: 'name,industry,headquarters_country\nAcme,Tech,US',
    }),
    previewImport: jest.fn().mockResolvedValue({
      jobId: 'job-1',
      totalRows: 2,
      validRows: 2,
      invalidRows: 0,
    }),
    executeImport: jest.fn().mockResolvedValue({
      message: 'Batch import executed successfully with status COMPLETED.',
      job: { id: 'job-1', status: 'COMPLETED', importedRows: 2 },
    }),
    listJobs: jest.fn().mockResolvedValue([]),
    getJobErrors: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportsController],
      providers: [
        {
          provide: ImportsService,
          useValue: mockImportsService,
        },
      ],
    }).compile();

    controller = module.get<ImportsController>(ImportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return csv template', () => {
    const res = controller.getTemplate('COMPANIES');
    expect(res.headers).toContain('name');
  });

  it('should preview import', async () => {
    const res = await controller.preview(
      { id: 'u1' },
      { importType: 'COMPANIES', fileName: 'test.csv', csvContent: 'name,industry,headquarters_country\nAcme,Tech,US' },
    );
    expect(res.jobId).toBe('job-1');
    expect(res.validRows).toBe(2);
  });

  it('should execute import', async () => {
    const res = await controller.execute({ id: 'u1' }, { jobId: 'job-1' });
    expect(res.job.status).toBe('COMPLETED');
  });
});
