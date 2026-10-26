import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ClaimCompanyDto } from './dto/claim-company.dto';
import { InviteEmployeeDto, AcceptInvitationDto } from './dto/invite-employee.dto';
import {
  AddCompanyDomainDto,
  AddCompanyRelationshipDto,
  MergeCompanyReviewDto,
  UpdateTeamCapacityDto,
  DepartmentRoutingRuleDto,
} from './dto/company-enterprise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { PortalScopeGuard } from '../auth/guards/portal-scope.guard';
import { PortalScope } from '../auth/decorators/portal-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Companies & Workflows')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'Search companies by name, domain, or industry with tokenization, filters, and pagination' })
  @ApiResponse({ status: 200, description: 'Companies list retrieved' })
  async search(
    @Query('q') query?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('industry') industry?: string,
    @Query('countryCode') countryCode?: string,
    @Query('verifiedOnly') verifiedOnly?: string,
    @Query('function') functionFilter?: string,
    @Query('seniority') seniorityFilter?: string,
    @Query('excludeCompanies') excludeCompanies?: string,
    @Query('excludeIndustries') excludeIndustries?: string,
  ) {
    return this.companiesService.searchCompanies(query, page, limit, {
      industry,
      countryCode,
      verifiedOnly: verifiedOnly === 'true' || verifiedOnly === '1',
      functionFilter,
      seniorityFilter,
      excludeCompanies,
      excludeIndustries,
    });
  }

  @Post('check-duplicates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check for potential duplicate companies by name and domain' })
  async checkDuplicates(@Body() body: { name: string; domain?: string }) {
    return this.companiesService.checkDuplicates(body.name, body.domain);
  }

  @Get('onboarding-draft')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user saved onboarding draft and step' })
  async getOnboardingDraft(@CurrentUser() user: any) {
    return this.companiesService.getOnboardingDraft(user.id);
  }

  @Put('onboarding-draft')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save onboarding draft state and active step' })
  async saveOnboardingDraft(
    @CurrentUser() user: any,
    @Body() body: { step: number; data: any },
  ) {
    return this.companiesService.saveOnboardingDraft(user.id, body.step, body.data);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new company listing and become OWNER' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companiesService.createCompany(user.id, dto);
  }

  @Get('my')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user active company memberships and registered entities' })
  async getMyCompanies(@CurrentUser() user: any) {
    return this.companiesService.getMyCompanies(user?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company details and active members' })
  @ApiResponse({ status: 200, description: 'Company details retrieved' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getById(@Param('id') id: string) {
    return this.companiesService.getCompanyById(id);
  }

  @Post(':id/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit an authorized claim for an existing company' })
  @ApiResponse({ status: 200, description: 'Claim request submitted' })
  async claim(
    @Param('id') companyId: string,
    @CurrentUser() user: any,
    @Body() dto: ClaimCompanyDto,
  ) {
    return this.companiesService.submitClaim(user.id, companyId, dto);
  }

  @Post(':id/verify-business')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enterprise verification for company domain & business (Bypass TXT, Work OTP, Document, Meta Tag)' })
  @ApiResponse({ status: 200, description: 'Organization and domain verified successfully' })
  async verifyBusiness(
    @Param('id') companyId: string,
    @CurrentUser() user: any,
    @Body()
    dto: {
      method?: string;
      workEmail?: string;
      otpCode?: string;
      documentType?: string;
      registrationNumber?: string;
      documentUrl?: string;
      manualToken?: string;
    },
  ) {
    return this.companiesService.verifyBusinessEntity(user?.id, companyId, dto);
  }

  @Post(':id/request-domain-otp')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request OTP challenge to verify corporate domain ownership' })
  async requestDomainOtp(
    @Param('id') companyId: string,
    @CurrentUser() user: any,
    @Body('email') email: string,
  ) {
    return this.companiesService.requestDomainOtp(user?.id, companyId, email);
  }

  @Post(':id/invitations')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite an employee to join company with single-use hashed token' })
  @ApiResponse({ status: 200, description: 'Invitation created and dispatched' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER or ADMIN role' })
  async invite(
    @Param('id') companyId: string,
    @CurrentUser() user: any,
    @Body() dto: InviteEmployeeDto,
  ) {
    return this.companiesService.inviteEmployee(user.id, companyId, dto.email);
  }

  @Get('invitations/preview')
  @ApiOperation({ summary: 'Preview invitation details by token' })
  @ApiResponse({ status: 200, description: 'Invitation details retrieved' })
  async previewInvitation(@Query('token') token: string) {
    return this.companiesService.previewInvitation(token);
  }

  @Post('invitations/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept single-use employee invitation' })
  @ApiResponse({ status: 200, description: 'Joined company successfully' })
  async acceptInvitation(
    @CurrentUser() user: any,
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.companiesService.acceptInvitation(user.id, dto.token);
  }

  @Post(':id/challenge-dns')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Feature #32: Generate unique DNS TXT challenge token for domain verification' })
  async generateDnsChallenge(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
  ) {
    return this.companiesService.generateDnsChallenge(user.id, companyId);
  }

  @Post(':id/verify-dns')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Features #4 & #32: Verify domain ownership via live DNS TXT record check' })
  async verifyDns(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Body('token') token?: string,
  ) {
    return this.companiesService.verifyDnsChallenge(user.id, companyId, token);
  }

  @Post(':id/domains')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #6: Add secondary verified domain to corporate workspace' })
  async addDomain(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Body() dto: AddCompanyDomainDto,
  ) {
    return this.companiesService.addCompanyDomain(user.id, companyId, dto.domain, dto.isPrimary);
  }

  @Post(':id/domains/:domainId/verify')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Feature #6: Verify secondary domain DNS TXT record' })
  async verifyDomain(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Param('domainId') domainId: string,
    @Body('token') token?: string,
  ) {
    return this.companiesService.verifyCompanyDomain(user.id, companyId, domainId, token);
  }

  @Post(':id/relationships')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #1: Link parent-subsidiary corporate hierarchy' })
  async addRelationship(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Body() dto: AddCompanyRelationshipDto,
  ) {
    return this.companiesService.addCompanyRelationship(
      user.id,
      companyId,
      dto.subsidiaryId,
      dto.relationshipType,
      dto.confidenceScore,
      dto.source,
    );
  }

  @Delete(':id/relationships/:relId')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink parent-subsidiary corporate hierarchy relationship' })
  async removeRelationship(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Param('relId') relId: string,
  ) {
    return this.companiesService.removeCompanyRelationship(user.id, companyId, relId);
  }

  @Get(':id/hierarchy')
  @ApiOperation({ summary: 'Feature #1: Get parent-subsidiary organizational tree' })
  async getHierarchy(@Param('id') companyId: string) {
    return this.companiesService.getCompanyHierarchy(companyId);
  }

  @Get(':id/org-chart')
  @ApiOperation({ summary: 'Feature #2: Corporate org-chart visualizer with department tiers' })
  async getOrgChart(@Param('id') companyId: string) {
    return this.companiesService.getCompanyOrgChart(companyId);
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #7: Enterprise duplicate entity merge review' })
  async mergeCompanies(
    @CurrentUser() user: any,
    @Body() dto: MergeCompanyReviewDto,
  ) {
    return this.companiesService.mergeCompanies(user.id, dto.targetCompanyId, dto.sourceCompanyId, dto.reviewNotes);
  }

  @Get(':id/team')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all company team members and colleagues' })
  async getCompanyTeam(@Param('id') companyId: string) {
    return this.companiesService.getCompanyTeam(companyId);
  }

  @Get(':id/workload')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #8: Team workload and bridge capacity meters' })
  async getWorkload(@Param('id') companyId: string) {
    return this.companiesService.getTeamWorkload(companyId);
  }

  @Post(':id/capacity')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #8: Configure team member bridge capacity' })
  async updateCapacity(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Body() dto: UpdateTeamCapacityDto,
  ) {
    return this.companiesService.updateMemberCapacity(
      user.id,
      companyId,
      dto.memberUserId,
      dto.maxOpenBridges,
      dto.department,
    );
  }

  @Patch(':id/members/:memberId')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update company team member department, role, or bridge capacity' })
  async updateMember(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Param('memberId') memberId: string,
    @Body() body: { companyRole?: 'ADMIN' | 'MEMBER'; department?: string; maxOpenBridges?: number },
  ) {
    return this.companiesService.updateMemberRoleAndDepartment(user.id, companyId, memberId, body);
  }

  @Delete(':id/members/:memberId')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove team member from company roster' })
  async removeMember(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.companiesService.removeCompanyMember(user.id, companyId, memberId);
  }

  @Post(':id/routing-rules')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #9: Create departmental inbound opportunity routing rule' })
  async createRoutingRule(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Body() dto: DepartmentRoutingRuleDto,
  ) {
    return this.companiesService.setDepartmentRoutingRule(
      user.id,
      companyId,
      dto.department,
      dto.categoryTag,
      dto.priority,
      dto.targetUserId,
    );
  }

  @Get(':id/routing-rules')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #9: List departmental routing rules' })
  async getRoutingRules(@Param('id') companyId: string) {
    return this.companiesService.getDepartmentRoutingRules(companyId);
  }

  @Delete(':id/routing-rules/:ruleId')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete departmental routing rule' })
  async deleteRoutingRule(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Param('ruleId') ruleId: string,
  ) {
    return this.companiesService.deleteDepartmentRoutingRule(user.id, companyId, ruleId);
  }

  @Get(':id/reputation')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #34: Corporate domain abuse & reputation indicators' })
  async getDomainReputation(@Param('id') companyId: string) {
    return this.companiesService.getDomainReputation(companyId);
  }

  @Get(':id/pipeline-metrics')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #50: Enterprise inbound pipeline conversion metrics' })
  async getPipelineMetrics(@Param('id') companyId: string) {
    return this.companiesService.getPipelineMetrics(companyId);
  }

  // Differentiator #3: Corporate Mandate Registry
  @Post(':id/mandates')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Differentiator #3: Attest corporate mandate to team member' })
  async createMandate(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Body()
    body: {
      authorizedProfileId: string;
      categoryScope: string;
      geographicScope: string;
      maxBudgetLimit?: number;
      validUntil?: string;
    },
  ) {
    return this.companiesService.createCorporateMandate(user.id, companyId, body);
  }

  @Get(':id/mandates')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Differentiator #3: List active corporate mandates' })
  async getMandates(@Param('id') companyId: string) {
    return this.companiesService.getCorporateMandates(companyId);
  }

  @Delete(':id/mandates/:mandateId')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Differentiator #3: Revoke corporate mandate' })
  async revokeMandate(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Param('mandateId') mandateId: string,
  ) {
    return this.companiesService.revokeCorporateMandate(user.id, companyId, mandateId);
  }

  // Differentiator #4: Reverse Discovery Marketplace
  @Post(':id/reverse-opportunities')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Differentiator #4: Broadcast commercial procurement / sourcing brief' })
  async createReverseOpportunity(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Body()
    body: {
      title: string;
      opportunityType: string;
      targetGeography: string;
      budgetBand: string;
      requirementsDoc: string;
      deadline?: string;
    },
  ) {
    return this.companiesService.createReverseOpportunity(user.id, companyId, body);
  }

  @Get('reverse-opportunities/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Differentiator #4: Explore active reverse commercial tenders' })
  async listReverseOpportunities(
    @Query('geography') geography?: string,
    @Query('type') type?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.companiesService.listReverseOpportunities({ geography, type, companyId });
  }

  @Post('reverse-opportunities/:opportunityId/bid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Differentiator #4: Submit verified commercial bid to reverse opportunity' })
  async submitBid(
    @CurrentUser() user: any,
    @Param('opportunityId') opportunityId: string,
    @Body()
    body: { proposalSummary: string; pricingEstimate?: number; requiresMnda?: boolean },
  ) {
    return this.companiesService.submitOpportunityBid(user.id, opportunityId, body);
  }

  @Get(':id/reverse-opportunities')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN', 'CONSUMER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List reverse sourcing opportunities for a specific company' })
  async getCompanyReverseOpportunities(
    @Param('id') companyId: string,
  ) {
    return this.companiesService.getCompanyReverseOpportunities(companyId);
  }

  @Get(':id/reverse-opportunities/:opportunityId/bids')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature Gap 140: Proposal Comparison Matrix - Fetch all bids for tender review' })
  async getOpportunityBids(
    @Param('id') companyId: string,
    @Param('opportunityId') opportunityId: string,
  ) {
    return this.companiesService.getOpportunityBids(companyId, opportunityId);
  }

  @Post(':id/reverse-opportunities/:opportunityId/bids/:bidId/respond')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('COMPANY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature Gap 140: Respond to proposal bid (Shortlist, Accept & Launch Deal Room, Decline)' })
  async respondOpportunityBid(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Param('opportunityId') opportunityId: string,
    @Param('bidId') bidId: string,
    @Body()
    body: { action: 'SHORTLIST' | 'ACCEPT' | 'DECLINE'; note?: string },
  ) {
    return this.companiesService.respondOpportunityBid(
      user.id,
      companyId,
      opportunityId,
      bidId,
      body.action,
      body.note,
    );
  }

  // Differentiator #5: Evidence-Backed Attribution Ledger
  @Get('attribution/ledger/:dealReferenceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Differentiator #5: Fetch auditable attribution event chain' })
  async getAttributionLedger(@Param('dealReferenceId') dealReferenceId: string) {
    return this.companiesService.getAttributionLedger(dealReferenceId);
  }

  @Post('attribution/record')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Differentiator #5: Record verified milestone to attribution ledger' })
  async recordAttribution(
    @CurrentUser() user: any,
    @Body()
    body: {
      dealReferenceId: string;
      companyId?: string;
      eventType: string;
      contributorRole: string;
      evidencePayload?: string;
      dealValue?: number;
    },
  ) {
    return this.companiesService.recordAttributionMilestone(user.id, body);
  }

  // Differentiator #4 / Option C: Bilateral Mutual NDA Execution
  @Post('attribution/execute-nda')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Option C: Cryptographically execute bilateral M-NDA on tender bid' })
  async executeNda(
    @CurrentUser() user: any,
    @Body()
    body: { bidId: string; signatoryName: string; signatoryTitle: string },
  ) {
    return this.companiesService.executeMutualNda(user.id, body.bidId, body.signatoryName, body.signatoryTitle);
  }

  // Differentiator #5 / Option D: Record Verified Calendar Meeting (.ICS)
  @Post('attribution/record-ics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Option D: Register cryptographic iCalendar RFC 5545 meeting proof' })
  async recordIcsMeeting(
    @CurrentUser() user: any,
    @Body()
    body: { dealReferenceId: string; meetingTitle: string; meetingTime: string; durationMinutes?: number },
  ) {
    return this.companiesService.recordIcsMeetingEvent(
      user.id,
      body.dealReferenceId,
      body.meetingTitle,
      new Date(body.meetingTime),
      body.durationMinutes || 45,
    );
  }

  // ==============================================================================
  // Feature Gap: Live Inbound Connection Triage & Contact Reveal (5 Actions)
  // ==============================================================================

  @Get(':id/inbound-connections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all company inbound connection requests with contact reveal state' })
  async getInboundConnections(@Param('id') companyId: string) {
    return this.companiesService.getCompanyInboundConnections(companyId);
  }

  @Post(':id/inbound-connections/:connectionId/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Action 1 & 4: Accept (with contact reveal) or Decline company connection' })
  async respondConnection(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Param('connectionId') connectionId: string,
    @Body() body: { action: 'ACCEPT' | 'DECLINE'; declineReasonCode?: string; declineNote?: string },
  ) {
    return this.companiesService.respondCompanyInboundConnection(
      user.id,
      companyId,
      connectionId,
      body.action,
      body.declineReasonCode,
      body.declineNote,
    );
  }

  @Post(':id/inbound-connections/:connectionId/clarify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Action 2: Request clarification on inbound connection' })
  async clarifyConnection(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Param('connectionId') connectionId: string,
    @Body() body: { question: string },
  ) {
    return this.companiesService.clarifyCompanyInboundConnection(
      user.id,
      companyId,
      connectionId,
      body.question,
    );
  }

  @Post(':id/inbound-connections/:connectionId/delegate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Action 3: Delegate connection to colleague (with optional contact unlock)' })
  async delegateConnection(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Param('connectionId') connectionId: string,
    @Body() body: { targetProfileId: string; delegationNote?: string; acceptAndConnect?: boolean },
  ) {
    return this.companiesService.delegateCompanyInboundConnection(
      user.id,
      companyId,
      connectionId,
      body.targetProfileId,
      body.delegationNote,
      body.acceptAndConnect,
    );
  }

  @Post(':id/inbound-connections/:connectionId/follow-up')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule follow-up reminder for connection' })
  async followUpConnection(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Param('connectionId') connectionId: string,
    @Body() body: { followUpDate: string; note?: string },
  ) {
    return this.companiesService.followUpCompanyInboundConnection(
      user.id,
      companyId,
      connectionId,
      new Date(body.followUpDate),
      body.note,
    );
  }

  @Get(':id/inbound-auto-reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Action 5: Fetch corporate auto-reply & SLA configuration' })
  async getAutoReply(@Param('id') companyId: string) {
    return this.companiesService.getCompanyAutoReply(companyId);
  }

  @Put(':id/inbound-auto-reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Action 5: Update corporate auto-reply & SLA configuration' })
  async updateAutoReply(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Body() body: { enabled: boolean; slaHours?: number; template?: string },
  ) {
    return this.companiesService.updateCompanyAutoReply(user.id, companyId, body);
  }

  @Get(':id/all-connections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all company connections with Who Handled Who status and delegation history' })
  async getAllCompanyConnections(@Param('id') companyId: string) {
    return this.companiesService.getCompanyAllConnections(companyId);
  }

  @Post(':id/connections/:connectionId/reassign')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Re-assign or reclaim company connection handling' })
  async reassignConnection(
    @CurrentUser() user: any,
    @Param('id') companyId: string,
    @Param('connectionId') connectionId: string,
    @Body()
    body: {
      targetProfileId?: string;
      note?: string;
      acceptAndConnect?: boolean;
      inviteEmail?: string;
      inviteName?: string;
      invitePhone?: string;
    },
  ) {
    return this.companiesService.reassignCompanyConnection(
      user.id,
      companyId,
      connectionId,
      body.targetProfileId,
      body.note,
      body.acceptAndConnect,
      body.inviteEmail,
      body.inviteName,
      body.invitePhone,
    );
  }
}
