import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;

  const mockCompaniesService = {
    searchCompanies: jest.fn().mockResolvedValue([
      { id: 'c1', name: 'Apex Pacific Distribution', domain: 'apexpacific.com' },
    ]),
    checkDuplicates: jest.fn().mockResolvedValue({
      hasDuplicate: false,
      matchedCompany: null,
    }),
    createCompany: jest.fn().mockImplementation((userId, dto) =>
      Promise.resolve({
        id: 'c1',
        name: dto.name,
        domain: dto.domain,
        verificationStatus: 'PENDING',
      }),
    ),
    getCompanyById: jest.fn().mockResolvedValue({
      id: 'c1',
      name: 'Apex Pacific Distribution',
      memberships: [],
    }),
    getMyCompanies: jest.fn().mockResolvedValue([]),
    submitClaim: jest.fn().mockResolvedValue({
      message: 'Claim request submitted successfully and is queued for verification review.',
      claim: { id: 'claim-1', status: 'PENDING' },
    }),
    inviteEmployee: jest.fn().mockResolvedValue({
      message: 'Employee invitation dispatched successfully',
      invitationId: 'inv-1',
      invitedEmail: 'colleague@apexpacific.com',
      inviteToken: 'raw_test_token',
    }),
    acceptInvitation: jest.fn().mockResolvedValue({
      message: 'Successfully joined Apex Pacific Distribution!',
      membership: { id: 'm-1', companyRole: 'MEMBER' },
    }),
    generateDnsChallenge: jest.fn().mockResolvedValue({
      companyId: 'c1',
      domain: 'apexpacific.com',
      txtRecordHost: '@',
      txtRecordValue: 'setu-verify-corp-testtoken123',
    }),
    verifyDnsChallenge: jest.fn().mockResolvedValue({
      success: true,
      companyId: 'c1',
      domain: 'apexpacific.com',
      verificationStatus: 'VERIFIED',
      mxConfigured: true,
      message: 'Domain apexpacific.com successfully verified via DNS TXT authentication.',
    }),
    addCompanyDomain: jest.fn().mockResolvedValue({
      message: 'Domain apexpacific.co.uk added.',
      domain: { id: 'd-1', domain: 'apexpacific.co.uk', verificationStatus: 'PENDING' },
    }),
    verifyCompanyDomain: jest.fn().mockResolvedValue({
      success: true,
      domain: { id: 'd-1', domain: 'apexpacific.co.uk', verificationStatus: 'VERIFIED' },
    }),
    addCompanyRelationship: jest.fn().mockResolvedValue({
      message: 'Corporate relationship linked',
      relationship: { id: 'rel-1', parentCompanyId: 'c1', subsidiaryId: 'c2' },
    }),
    getCompanyHierarchy: jest.fn().mockResolvedValue({
      id: 'c1',
      name: 'Apex Pacific Distribution',
      parentRelations: [],
      subsidiaryRelations: [],
    }),
    mergeCompanies: jest.fn().mockResolvedValue({
      success: true,
      message: 'Entity successfully merged',
    }),
    getTeamWorkload: jest.fn().mockResolvedValue([
      { userId: 'u1', name: 'Marcus Chen', activeBridges: 3, maxOpenBridges: 20, capacityPercent: 15 },
    ]),
    updateMemberCapacity: jest.fn().mockResolvedValue({
      success: true,
      membership: { id: 'm-1', maxOpenBridges: 25 },
    }),
    setDepartmentRoutingRule: jest.fn().mockResolvedValue({
      success: true,
      rule: { id: 'rule-1', department: 'Sales', priority: 1 },
    }),
    getDepartmentRoutingRules: jest.fn().mockResolvedValue([
      { id: 'rule-1', department: 'Sales', priority: 1 },
    ]),
    getCompanyOrgChart: jest.fn().mockResolvedValue({
      companyId: 'c1',
      companyName: 'Apex Pacific Distribution',
      domain: 'apexpacific.com',
      totalHeadcount: 2,
      executiveTier: [{ profileId: 'p1', name: 'Marcus Chen', title: 'Managing Director' }],
      departments: [{ name: 'Executive', memberCount: 1, members: [] }],
    }),
    getDomainReputation: jest.fn().mockResolvedValue({
      companyId: 'c1',
      trustScore: 90,
      reputationTier: 'TIER_1_EXCELLENT',
      spfDkimConfigured: true,
      abuseIncidents: 0,
    }),
    getPipelineMetrics: jest.fn().mockResolvedValue({
      companyId: 'c1',
      totalInboundBridges: 12,
      conversionRatePercent: 75,
      responseRatePercent: 92,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: mockCompaniesService,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should search companies', async () => {
    const res = await controller.search('Apex');
    expect(res).toHaveLength(1);
    expect(res[0].name).toBe('Apex Pacific Distribution');
  });

  it('should check for duplicates', async () => {
    const res = await controller.checkDuplicates({ name: 'New Co', domain: 'newco.com' });
    expect(res.hasDuplicate).toBe(false);
  });

  it('should create a company', async () => {
    const res = await controller.create(
      { id: 'u1' },
      { name: 'Apex Pacific Distribution', domain: 'apexpacific.com' },
    );
    expect(res.name).toBe('Apex Pacific Distribution');
  });

  it('should invite employee and generate single-use token', async () => {
    const res = await controller.invite(
      'c1',
      { id: 'u1' },
      { email: 'colleague@apexpacific.com' },
    );
    expect(res.invitedEmail).toBe('colleague@apexpacific.com');
    expect(res.inviteToken).toBeDefined();
  });

  it('should accept employee invitation', async () => {
    const res = await controller.acceptInvitation(
      { id: 'u2' },
      { token: 'raw_test_token' },
    );
    expect(res.message).toContain('Successfully joined');
  });

  it('should generate DNS challenge token for domain verification (Feature #32)', async () => {
    const res = await controller.generateDnsChallenge({ id: 'u1' }, 'c1');
    expect(res.txtRecordValue).toContain('setu-verify-corp');
    expect(res.domain).toBe('apexpacific.com');
  });

  it('should verify domain ownership via DNS challenge (Features #4 & #32)', async () => {
    const res = await controller.verifyDns({ id: 'u1' }, 'c1', 'setu-verify-corp-testtoken123');
    expect(res.success).toBe(true);
    expect(res.verificationStatus).toBe('VERIFIED');
    expect(res.mxConfigured).toBe(true);
  });

  it('should add secondary domain and verify it (Feature #6)', async () => {
    const addRes = await controller.addDomain({ id: 'u1' }, 'c1', { domain: 'apexpacific.co.uk' });
    expect(addRes.domain.domain).toBe('apexpacific.co.uk');
    const verifyRes = await controller.verifyDomain({ id: 'u1' }, 'c1', 'd-1');
    expect(verifyRes.domain.verificationStatus).toBe('VERIFIED');
  });

  it('should link corporate parent-subsidiary hierarchy (Feature #1)', async () => {
    const res = await controller.addRelationship({ id: 'u1' }, 'c1', {
      subsidiaryId: 'c2',
      relationshipType: 'SUBSIDIARY',
    });
    expect(res.relationship.subsidiaryId).toBe('c2');
  });

  it('should review and merge duplicate companies (Feature #7)', async () => {
    const res = await controller.mergeCompanies({ id: 'u1' }, {
      targetCompanyId: 'c1',
      sourceCompanyId: 'c2',
      reviewNotes: 'Duplicate company merge',
    });
    expect(res.success).toBe(true);
  });

  it('should get team workload meters and update capacity (Feature #8)', async () => {
    const workload = await controller.getWorkload('c1');
    expect(Array.isArray(workload)).toBe(true);
    expect(workload[0].capacityPercent).toBe(15);

    const updateRes = await controller.updateCapacity({ id: 'u1' }, 'c1', {
      memberUserId: 'u2',
      maxOpenBridges: 25,
      department: 'Sales',
    });
    expect(updateRes.membership.maxOpenBridges).toBe(25);
  });

  it('should create and retrieve departmental routing rules (Feature #9)', async () => {
    const ruleRes = await controller.createRoutingRule({ id: 'u1' }, 'c1', {
      department: 'Sales',
      priority: 1,
    });
    expect(ruleRes.rule.department).toBe('Sales');

    const rules = await controller.getRoutingRules('c1');
    expect(rules.length).toBe(1);
  });

  it('should retrieve corporate org-chart visualizer with department tiers (Feature #2)', async () => {
    const orgChart = await controller.getOrgChart('c1');
    expect(orgChart.companyId).toBe('c1');
    expect(orgChart.totalHeadcount).toBe(2);
    expect(orgChart.executiveTier.length).toBe(1);
    expect(orgChart.departments.length).toBe(1);
  });

  it('should evaluate corporate domain abuse and reputation indicators (Feature #34)', async () => {
    const rep = await controller.getDomainReputation('c1');
    expect(rep.trustScore).toBe(90);
    expect(rep.reputationTier).toBe('TIER_1_EXCELLENT');
    expect(rep.spfDkimConfigured).toBe(true);
  });

  it('should calculate enterprise inbound pipeline conversion metrics (Feature #50)', async () => {
    const metrics = await controller.getPipelineMetrics('c1');
    expect(metrics.totalInboundBridges).toBe(12);
    expect(metrics.conversionRatePercent).toBe(75);
    expect(metrics.responseRatePercent).toBe(92);
  });
});
