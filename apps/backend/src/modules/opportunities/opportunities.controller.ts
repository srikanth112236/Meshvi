import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { ExpressInterestDto } from './dto/express-interest.dto';
import { ClarifyRequestDto, DeclineRequestDto } from './dto/clarify-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalScopeGuard } from '../auth/guards/portal-scope.guard';
import { PortalScope } from '../auth/decorators/portal-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Mutual Opportunity Matching (Gap 1)')
@Controller('opportunities')
@UseGuards(JwtAuthGuard, PortalScopeGuard)
@PortalScope('CONSUMER')
@ApiBearerAuth()
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gap 1: Create a draft or active business opportunity profile' })
  async createOpportunity(@CurrentUser() user: any, @Body() dto: CreateOpportunityDto) {
    return this.opportunitiesService.createOpportunity(user.id, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Gap 1: List all opportunities owned by user (company or professional)' })
  async getMyOpportunities(@CurrentUser() user: any) {
    return this.opportunitiesService.getMyOpportunities(user.id);
  }

  @Get('discover')
  @ApiOperation({ summary: 'Gap 1: Discover active public opportunities across the network' })
  async discoverOpportunities(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('industry') industry?: string,
  ) {
    return this.opportunitiesService.discoverOpportunities(user.id, { search, industry });
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Gap 1: Get active discoverable opportunities for a specific company' })
  async getCompanyOpportunities(@Param('companyId') companyId: string) {
    return this.opportunitiesService.getCompanyOpportunities(companyId);
  }

  @Get('matches')
  @ApiOperation({ summary: 'Gap 1: Get eligible mutual matches with two-sided overlap evidence' })
  async getMatches(
    @CurrentUser() user: any,
    @Query('opportunityId') opportunityId?: string,
    @Query('level') level?: string,
  ) {
    return this.opportunitiesService.getMatches(user.id, { opportunityId, level });
  }

  @Get('requests')
  @ApiOperation({ summary: 'Gap 1: List sent, received, or all business opportunity requests' })
  async getRequests(
    @CurrentUser() user: any,
    @Query('type') type?: 'received' | 'sent' | 'all',
  ) {
    return this.opportunitiesService.getRequests(user.id, type || 'all');
  }

  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gap 1: Express business interest in an opportunity (Send Request)' })
  async expressInterest(@CurrentUser() user: any, @Body() dto: ExpressInterestDto) {
    return this.opportunitiesService.expressInterest(user.id, dto);
  }

  @Post('requests/:id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gap 1: Accept an opportunity request (establishes Connection & Deal Room)' })
  async acceptRequest(@CurrentUser() user: any, @Param('id') requestId: string) {
    return this.opportunitiesService.acceptRequest(user.id, requestId);
  }

  @Post('requests/:id/decline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gap 1: Decline an opportunity request' })
  async declineRequest(
    @CurrentUser() user: any,
    @Param('id') requestId: string,
    @Body() dto: DeclineRequestDto,
  ) {
    return this.opportunitiesService.declineRequest(user.id, requestId, dto.reason);
  }

  @Post('requests/:id/clarify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gap 1: Ask or answer a clarification question before accepting' })
  async clarifyRequest(
    @CurrentUser() user: any,
    @Param('id') requestId: string,
    @Body() dto: ClarifyRequestDto,
  ) {
    return this.opportunitiesService.clarifyRequest(user.id, requestId, dto.question, dto.answer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Gap 1: Get an authorized opportunity by ID' })
  async getOpportunity(@CurrentUser() user: any, @Param('id') id: string) {
    return this.opportunitiesService.getOpportunity(user.id, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gap 1: Update an owned opportunity' })
  async updateOpportunity(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.updateOpportunity(user.id, id, dto);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gap 1: Publish an opportunity and trigger mutual matching' })
  async publishOpportunity(@CurrentUser() user: any, @Param('id') id: string) {
    return this.opportunitiesService.publishOpportunity(user.id, id);
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gap 1: Pause an active opportunity' })
  async pauseOpportunity(@CurrentUser() user: any, @Param('id') id: string) {
    return this.opportunitiesService.pauseOpportunity(user.id, id);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gap 1: Archive an opportunity' })
  async archiveOpportunity(@CurrentUser() user: any, @Param('id') id: string) {
    return this.opportunitiesService.archiveOpportunity(user.id, id);
  }
}
