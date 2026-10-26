import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PortalScopeGuard } from '../auth/guards/portal-scope.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PortalScope } from '../auth/decorators/portal-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType, AccountStatus, VerificationStatus } from '@prisma/client';

@ApiTags('Admin Operations & Pilot Readiness')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PortalScopeGuard)
@Roles(RoleType.SUPER_ADMIN)
@PortalScope('SUPER_ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Platform operational metrics and status' })
  async getDashboard() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('users')
  @ApiOperation({ summary: 'List and filter users across the platform' })
  async getUsers(@Query('q') query?: string) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user account status (ACTIVE, SUSPENDED)' })
  async updateUserStatus(
    @CurrentUser() admin: any,
    @Param('id') userId: string,
    @Body('status') status: AccountStatus,
  ) {
    return this.adminService.updateUserStatus(admin.id, userId, status);
  }

  @Get('companies')
  @ApiOperation({ summary: 'List companies across the platform' })
  async getCompanies(@Query('q') query?: string) {
    return this.adminService.getCompanies(query);
  }

  @Patch('companies/:id/verification')
  @ApiOperation({ summary: 'Update company verification status' })
  async updateCompanyVerification(
    @CurrentUser() admin: any,
    @Param('id') companyId: string,
    @Body('verificationStatus') verificationStatus: VerificationStatus,
  ) {
    return this.adminService.updateCompanyVerification(admin.id, companyId, verificationStatus);
  }

  @Get('verifications')
  @ApiOperation({ summary: 'Point 1: Get verification & impersonation prevention queue' })
  async getVerifications() {
    return this.adminService.getVerificationQueue();
  }

  @Post('verifications/decision')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Point 1: Process verification decision (APPROVE, REJECT, REQUEST_PROOF)' })
  async processVerificationDecision(
    @CurrentUser() admin: any,
    @Body() body: {
      entityType: 'PROFILE' | 'COMPANY' | 'CLAIM';
      entityId: string;
      decision: 'APPROVE' | 'REJECT' | 'REQUEST_PROOF';
      notes?: string;
    },
  ) {
    return this.adminService.processVerificationDecision(admin.id, body);
  }

  @Get('ai-usage')
  @ApiOperation({ summary: 'AI provider token usage and latency metrics' })
  async getAiUsage() {
    return this.adminService.getAiUsageStats();
  }

  @Get('ai-governance')
  @ApiOperation({ summary: 'Point 2: Platform-wide AI Cost & Latency Command Center metrics' })
  async getAiGovernance() {
    return this.adminService.getAiUsageStats();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'View immutable system audit logs' })
  async getAuditLogs(@Query('limit') limit?: number) {
    return this.adminService.getAuditLogs(limit ? Number(limit) : 100);
  }

  @Post('users/:id/privacy-erase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fulfill GDPR/DPDP right to be forgotten request' })
  async privacyErase(
    @CurrentUser() admin: any,
    @Param('id') userId: string,
  ) {
    return this.adminService.processPrivacyDeletion(admin.id, userId);
  }

  @Get('reported-posts')
  @ApiOperation({ summary: 'List all reported posts for moderation' })
  async getReportedPosts() {
    return this.adminService.getReportedPosts();
  }

  @Post('reported-posts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a new reported post for moderation' })
  async createReportedPost(@Body() body: any) {
    return this.adminService.createReportedPost(body);
  }

  @Patch('reported-posts/:id/action')
  @ApiOperation({ summary: 'Take moderation action on a reported post' })
  async moderateReportedPost(
    @CurrentUser() admin: any,
    @Param('id') reportId: string,
    @Body() body: { action: 'DISMISS' | 'TAKEDOWN'; note?: string },
  ) {
    return this.adminService.moderateReportedPost(admin.id, reportId, body.action, body.note);
  }
}
