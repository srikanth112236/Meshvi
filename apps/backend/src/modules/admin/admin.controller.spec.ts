import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AccountStatus, VerificationStatus } from '@prisma/client';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  const mockAdminService = {
    getDashboardMetrics: jest.fn(),
    getUsers: jest.fn(),
    updateUserStatus: jest.fn(),
    getCompanies: jest.fn(),
    updateCompanyVerification: jest.fn(),
    getAiUsageStats: jest.fn(),
    getAuditLogs: jest.fn(),
    processPrivacyDeletion: jest.fn(),
  };

  const mockAdmin = { id: 'admin-1', roles: ['SUPER_ADMIN'] };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should get dashboard overview', async () => {
    mockAdminService.getDashboardMetrics.mockResolvedValue({ overview: { totalUsers: 5 } });
    const res = await controller.getDashboard();
    expect(res).toHaveProperty('overview');
  });

  it('should update user status', async () => {
    mockAdminService.updateUserStatus.mockResolvedValue({ id: 'u-1', accountStatus: AccountStatus.SUSPENDED });
    const res = await controller.updateUserStatus(mockAdmin, 'u-1', AccountStatus.SUSPENDED);
    expect(res).toHaveProperty('accountStatus', AccountStatus.SUSPENDED);
    expect(mockAdminService.updateUserStatus).toHaveBeenCalledWith(mockAdmin.id, 'u-1', AccountStatus.SUSPENDED);
  });

  it('should update company verification status', async () => {
    mockAdminService.updateCompanyVerification.mockResolvedValue({ id: 'c-1', verificationStatus: VerificationStatus.VERIFIED });
    const res = await controller.updateCompanyVerification(mockAdmin, 'c-1', VerificationStatus.VERIFIED);
    expect(res).toHaveProperty('verificationStatus', VerificationStatus.VERIFIED);
  });
});
