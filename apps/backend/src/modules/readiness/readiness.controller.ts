import { Controller, Get, Put, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReadinessService } from './readiness.service';
import { UpsertReadinessDto } from './dto/upsert-readiness.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalScopeGuard } from '../auth/guards/portal-scope.guard';
import { PortalScope } from '../auth/decorators/portal-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Partnership Readiness')
@Controller()
@UseGuards(JwtAuthGuard, PortalScopeGuard)
@ApiBearerAuth()
export class ReadinessController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Get('readiness/me')
  @PortalScope('CONSUMER')
  @ApiOperation({ summary: 'F1: Get my partnership readiness signal' })
  async getMyReadiness(@CurrentUser() user: any) {
    return this.readinessService.getMyReadiness(user.id);
  }

  @Put('readiness/me')
  @PortalScope('CONSUMER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'F1: Upsert my partnership readiness signal' })
  async upsertMyReadiness(@CurrentUser() user: any, @Body() dto: UpsertReadinessDto) {
    return this.readinessService.upsertMyReadiness(user.id, dto);
  }

  @Get('readiness/profile/:profileId')
  @PortalScope('CONSUMER')
  @ApiOperation({ summary: 'F1: Get readiness for a specific profile' })
  async getProfileReadiness(@Param('profileId') profileId: string) {
    return this.readinessService.getProfileReadiness(profileId);
  }

  @Get('readiness/company/:companyId')
  @PortalScope('CONSUMER')
  @ApiOperation({ summary: 'F1: Get readiness for a company' })
  async getCompanyReadiness(@Param('companyId') companyId: string) {
    return this.readinessService.getCompanyReadiness(companyId);
  }

  @Put('readiness/company/:companyId')
  @PortalScope('COMPANY_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'F1: Set company readiness (company admin only)' })
  async upsertCompanyReadiness(
    @CurrentUser() user: any,
    @Param('companyId') companyId: string,
    @Body() dto: UpsertReadinessDto,
  ) {
    return this.readinessService.upsertCompanyReadiness(user.id, companyId, dto);
  }
}
