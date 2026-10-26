import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AccountStatus, VerificationStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * System-wide metrics dashboard for Superadmin
   */
  async getDashboardMetrics() {
    const [
      totalUsers,
      totalCompanies,
      totalProfiles,
      totalConnections,
      totalIntroductions,
      totalAiEvents,
      totalImportJobs,
      emailQueueCount,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.company.count(),
      this.prisma.professionalProfile.count(),
      this.prisma.connection.count({ where: { status: 'ACCEPTED' } }),
      this.prisma.introductionRequest.count(),
      this.prisma.aiUsageEvent.count(),
      this.prisma.dataImportJob.count(),
      this.prisma.emailOutbox.count({ where: { status: 'PENDING' } }),
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalCompanies,
        totalProfiles,
        totalConnections,
        totalIntroductions,
        totalAiEvents,
        totalImportJobs,
        pendingEmails: emailQueueCount,
      },
      recentAuditLogs: recentAuditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        actorEmail: log.user?.email || 'SYSTEM',
        createdAt: log.createdAt,
      })),
    };
  }

  /**
   * List all registered users with their profiles and roles
   */
  async getUsers(query?: string) {
    return this.prisma.user.findMany({
      where: query
        ? {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { profile: { displayName: { contains: query, mode: 'insensitive' } } },
            ],
          }
        : undefined,
      include: {
        roles: true,
        profile: { include: { company: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Update user status (ACTIVE, SUSPENDED, PENDING)
   */
  async updateUserStatus(adminUserId: string, targetUserId: string, status: AccountStatus) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { accountStatus: status },
    });

    await this.logAudit(adminUserId, `USER_STATUS_CHANGE_${status}`, 'User', targetUserId, {
      previousStatus: user.accountStatus,
      newStatus: status,
    });

    return updated;
  }

  /**
   * List companies for administration
   */
  async getCompanies(query?: string) {
    return this.prisma.company.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { domain: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        _count: {
          select: { memberships: true, profiles: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Verify or reject company listing
   */
  async updateCompanyVerification(
    adminUserId: string,
    companyId: string,
    verificationStatus: VerificationStatus,
  ) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found');

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: { verificationStatus },
    });

    await this.logAudit(adminUserId, `COMPANY_VERIFICATION_${verificationStatus}`, 'Company', companyId, {
      previousStatus: company.verificationStatus,
      newStatus: verificationStatus,
    });

    return updated;
  }

  /**
   * Verification & Impersonation Prevention Queue
   */
  async getVerificationQueue() {
    const [pendingProfiles, pendingCompanies, pendingClaims] = await Promise.all([
      this.prisma.professionalProfile.findMany({
        where: {
          OR: [
            { verificationStatus: 'PENDING' },
            { verificationStatus: 'UNVERIFIED', completenessScore: { gte: 80 } },
          ],
        },
        include: { company: true, user: true },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      }),
      this.prisma.company.findMany({
        where: {
          verificationStatus: { in: ['PENDING', 'UNVERIFIED'] },
        },
        include: {
          _count: { select: { profiles: true, memberships: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.companyClaimRequest.findMany({
        where: { status: 'PENDING' },
        include: { company: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return {
      summary: {
        totalPending: pendingProfiles.length + pendingCompanies.length + pendingClaims.length,
        profilesCount: pendingProfiles.length,
        companiesCount: pendingCompanies.length,
        claimsCount: pendingClaims.length,
      },
      profiles: pendingProfiles.map((p) => ({
        id: p.id,
        type: 'PROFILE' as const,
        displayName: p.displayName,
        currentTitle: p.currentTitle,
        companyName: p.company?.name || 'Independent',
        userEmail: p.user?.email,
        verificationStatus: p.verificationStatus,
        completenessScore: p.completenessScore,
        isWorkEmailVerified: p.isWorkEmailVerified,
        city: p.city,
        countryCode: p.countryCode,
        updatedAt: p.updatedAt,
      })),
      companies: pendingCompanies.map((c) => ({
        id: c.id,
        type: 'COMPANY' as const,
        name: c.name,
        domain: c.domain,
        industry: c.industry,
        verificationStatus: c.verificationStatus,
        headquartersCity: c.headquartersCity,
        headquartersCountry: c.headquartersCountry,
        membersCount: c._count.memberships,
        createdAt: c.createdAt,
      })),
      claims: pendingClaims.map((cl) => ({
        id: cl.id,
        type: 'CLAIM' as const,
        companyId: cl.companyId,
        companyName: cl.company?.name || 'Company',
        companyDomain: cl.company?.domain,
        requestedByUserId: cl.requestedByUserId,
        verificationMethod: cl.verificationMethod,
        evidenceReference: cl.evidenceReference,
        status: cl.status,
        createdAt: cl.createdAt,
      })),
    };
  }

  async processVerificationDecision(
    adminUserId: string,
    data: {
      entityType: 'PROFILE' | 'COMPANY' | 'CLAIM';
      entityId: string;
      decision: 'APPROVE' | 'REJECT' | 'REQUEST_PROOF';
      notes?: string;
    },
  ) {
    const { entityType, entityId, decision, notes } = data;
    const targetStatus = decision === 'APPROVE' ? 'VERIFIED' : decision === 'REJECT' ? 'REJECTED' : 'PENDING';

    if (entityType === 'PROFILE') {
      const profile = await this.prisma.professionalProfile.findUnique({ where: { id: entityId } });
      if (!profile) throw new NotFoundException('Profile not found');

      const updated = await this.prisma.professionalProfile.update({
        where: { id: entityId },
        data: {
          verificationStatus: targetStatus as any,
          isRoleConfirmed: decision === 'APPROVE',
          lastVerifiedAt: decision === 'APPROVE' ? new Date() : undefined,
          roleConfirmedBy: decision === 'APPROVE' ? adminUserId : undefined,
          roleConfirmedAt: decision === 'APPROVE' ? new Date() : undefined,
        },
      });

      await this.logAudit(adminUserId, `PROFILE_VERIFY_${decision}`, 'ProfessionalProfile', entityId, {
        decision,
        notes,
        previousStatus: profile.verificationStatus,
      });

      return { success: true, updated };
    }

    if (entityType === 'COMPANY') {
      const company = await this.prisma.company.findUnique({ where: { id: entityId } });
      if (!company) throw new NotFoundException('Company not found');

      const updated = await this.prisma.company.update({
        where: { id: entityId },
        data: {
          verificationStatus: targetStatus as any,
          verifiedAt: decision === 'APPROVE' ? new Date() : undefined,
        },
      });

      await this.logAudit(adminUserId, `COMPANY_VERIFY_${decision}`, 'Company', entityId, {
        decision,
        notes,
        previousStatus: company.verificationStatus,
      });

      return { success: true, updated };
    }

    if (entityType === 'CLAIM') {
      const claim = await this.prisma.companyClaimRequest.findUnique({ where: { id: entityId } });
      if (!claim) throw new NotFoundException('Claim request not found');

      const claimStatus = decision === 'APPROVE' ? 'VERIFIED' : decision === 'REJECT' ? 'REJECTED' : 'PENDING';
      const updated = await this.prisma.companyClaimRequest.update({
        where: { id: entityId },
        data: {
          status: claimStatus as any,
          reviewedByUserId: adminUserId,
          reviewedAt: new Date(),
          reviewNotes: notes || `Admin decided: ${decision}`,
        },
      });

      if (decision === 'APPROVE') {
        await this.prisma.company.update({
          where: { id: claim.companyId },
          data: { verificationStatus: 'VERIFIED', verifiedAt: new Date() },
        });

        const existingMembership = await this.prisma.companyMembership.findFirst({
          where: { companyId: claim.companyId, userId: claim.requestedByUserId },
        });

        if (!existingMembership) {
          await this.prisma.companyMembership.create({
            data: {
              companyId: claim.companyId,
              userId: claim.requestedByUserId,
              companyRole: 'ADMIN',
              membershipStatus: 'ACTIVE',
            },
          });
        }
      }

      await this.logAudit(adminUserId, `CLAIM_VERIFY_${decision}`, 'CompanyClaimRequest', entityId, {
        decision,
        notes,
        companyId: claim.companyId,
      });

      return { success: true, updated };
    }

    throw new BadRequestException('Invalid entityType');
  }

  /**
   * AI Usage Analytics & Observability
   */
  async getAiUsageStats() {
    const events = await this.prisma.aiUsageEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: true },
    });

    const totalCost = events.reduce((acc, ev) => acc + (ev.estimatedCost || 0), 0);
    const totalTokens = events.reduce(
      (acc, ev) => acc + (ev.inputTokens || 0) + (ev.outputTokens || 0),
      0,
    );
    const promptTokens = events.reduce((acc, ev) => acc + (ev.inputTokens || 0), 0);
    const completionTokens = events.reduce((acc, ev) => acc + (ev.outputTokens || 0), 0);

    const latencies = events.map((e) => e.latencyMs || 0).sort((a, b) => a - b);
    const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    const p95Latency = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] || latencies[latencies.length - 1] : 0;

    const providerCounts: Record<string, number> = {};
    const taskCounts: Record<string, number> = {};

    for (const ev of events) {
      providerCounts[ev.providerName] = (providerCounts[ev.providerName] || 0) + 1;
      taskCounts[ev.taskType] = (taskCounts[ev.taskType] || 0) + 1;
    }

    return {
      summary: {
        totalCalls: events.length,
        totalTokens,
        promptTokens,
        completionTokens,
        totalCostUSD: Number(totalCost.toFixed(4)),
        avgLatencyMs: avgLatency,
        p95LatencyMs: p95Latency,
        successRate: events.length > 0 ? Math.round((events.filter((e) => e.status === 'SUCCESS').length / events.length) * 100) : 100,
      },
      distribution: {
        providers: Object.entries(providerCounts).map(([name, count]) => ({ name, count })),
        tasks: Object.entries(taskCounts).map(([type, count]) => ({ type, count })),
      },
      recentEvents: events.map((e) => ({
        id: e.id,
        taskType: e.taskType,
        provider: e.providerName,
        model: e.modelName,
        tokens: (e.inputTokens || 0) + (e.outputTokens || 0),
        latencyMs: e.latencyMs,
        status: e.status,
        userEmail: e.user?.email || 'ANONYMOUS',
        createdAt: e.createdAt,
      })),
    };
  }

  /**
   * Search and view platform Audit Logs
   */
  async getAuditLogs(limit: number = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: true },
    });
  }

  /**
   * Data Privacy / GDPR / DPDP: Process Profile Deletion or Data Export Request
   */
  async processPrivacyDeletion(adminUserId: string, targetUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // Soft delete or anonymize profile to protect data integrity while respecting erasure
    if (user.profile) {
      await this.prisma.professionalProfile.update({
        where: { id: user.profile.id },
        data: {
          displayName: 'Redacted Member',
          headline: 'Account closed by privacy request',
          summary: null,
          visibility: 'PRIVATE',
        },
      });
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        accountStatus: AccountStatus.SUSPENDED,
        deletedAt: new Date(),
      },
    });

    await this.logAudit(adminUserId, 'PRIVACY_ERASURE_PROCESSED', 'User', targetUserId, {
      erasedUserEmail: user.email,
    });

    return { status: 'erased', user: updatedUser };
  }

  // In-memory / audit-tracked reported posts store
  private static reportedPostsStore: any[] = [
    {
      id: 'rep-1',
      postId: 'post-legacy-mock',
      postTitle: 'Unverified Wholesale Aviation Sourcing Request',
      postAuthorName: 'Anonymous Broker',
      postAuthorCompany: 'Global Intermediaries Ltd',
      postContentSnippet: 'Promising 100% tax rebate concessions without formal regulatory registration...',
      reporterName: 'Srikanth',
      reporterEmail: 'srikanth@apexind.com',
      reason: 'MISLEADING',
      details: 'Unlicensed entity claiming airport concession tenders without civil aviation clearance.',
      status: 'PENDING_REVIEW',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ];

  async getReportedPosts() {
    return AdminService.reportedPostsStore;
  }

  async createReportedPost(data: any) {
    const newReport = {
      id: `rep-${Date.now()}`,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
      ...data,
    };
    AdminService.reportedPostsStore.unshift(newReport);
    return newReport;
  }

  async moderateReportedPost(adminUserId: string, reportId: string, action: string, note?: string) {
    const report = AdminService.reportedPostsStore.find((r) => r.id === reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = action === 'TAKEDOWN' ? 'POST_REMOVED' : 'RESOLVED_DISMISSED';
    report.reviewedAt = new Date().toISOString();
    report.adminActionNote = note || `Moderated by admin with action: ${action}`;

    await this.logAudit(adminUserId, `POST_MODERATED_${action}`, 'PartnershipPost', report.postId, {
      reportId,
      action,
      note,
    });

    return report;
  }

  private async logAudit(
    adminUserId: string,
    action: string,
    resource: string,
    resourceId: string,
    metadata: Record<string, any>,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action,
          resource,
          resourceId,
          metadata: JSON.stringify(metadata),
        },
      });
    } catch {
      // Non-fatal
    }
  }
}
