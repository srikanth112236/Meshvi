import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConnectionsService } from './connections.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { RespondConnectionDto, ConnectionResponseAction } from './dto/respond-connection.dto';
import { CreateIntroductionDto } from './dto/create-introduction.dto';
import { RespondIntroductionDto } from './dto/respond-introduction.dto';
import {
  SmartDraftDto,
  LintNoteDto,
  ClarifyConnectionDto,
  AnswerClarificationDto,
  RemindConnectionDto,
} from './dto/wave3-connection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalScopeGuard } from '../auth/guards/portal-scope.guard';
import { PortalScope } from '../auth/decorators/portal-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RateLimitGuard, RateLimit } from '../../common/guards/rate-limit.guard';

@ApiTags('Connections & Introductions')
@Controller()
@UseGuards(JwtAuthGuard, RateLimitGuard, PortalScopeGuard)
@PortalScope('CONSUMER', 'COMPANY_ADMIN')
@ApiBearerAuth()
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post('connections')
  @HttpCode(HttpStatus.CREATED)
  @RateLimit({ limit: 20, windowMs: 60000, actionName: 'CONNECTION_REQUEST' })
  @ApiOperation({ summary: 'Send a direct connection request' })
  @ApiResponse({ status: 201, description: 'Connection request created' })
  async requestConnection(
    @CurrentUser() user: any,
    @Body() dto: CreateConnectionDto,
  ) {
    return this.connectionsService.requestConnection(user.id, dto);
  }

  @Get('connections')
  @ApiOperation({ summary: 'List all accepted active connections for current user' })
  async getActiveConnections(@CurrentUser() user: any) {
    return this.connectionsService.getActiveConnections(user.id);
  }

  @Get('connections/quota')
  @ApiOperation({ summary: 'Get current user 7-day rolling connection request quota status' })
  async getConnectionQuota(@CurrentUser() user: any) {
    return this.connectionsService.getConnectionQuota(user.id);
  }

  @Get('connections/requests')
  @ApiOperation({ summary: 'List incoming and outgoing connection requests' })
  async getConnectionRequests(@CurrentUser() user: any) {
    return this.connectionsService.getConnectionRequests(user.id);
  }

  @Get('connections/connectors')
  @ApiOperation({ summary: 'Retrieve available connectors/intermediaries for warm introductions' })
  async getAvailableConnectors(@CurrentUser() user: any) {
    return this.connectionsService.getAvailableConnectors(user.id);
  }

  @Post('connections/smart-draft')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Feature Gap 201 & 203: Generate institutional 300-char smart draft notes matching recipient demands' })
  async generateSmartDrafts(
    @CurrentUser() user: any,
    @Body() dto: SmartDraftDto,
  ) {
    return this.connectionsService.generateSmartDrafts(user.id, dto);
  }

  @Post('connections/lint-note')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Feature Gap 202 & 204: Prohibited salesy phrasing & 300-char limit linter' })
  async lintNote(@Body() dto: LintNoteDto) {
    return this.connectionsService.lintNote(dto);
  }

  @Post('connections/:id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an incoming connection request' })
  async acceptConnection(
    @CurrentUser() user: any,
    @Param('id') connectionId: string,
  ) {
    return this.connectionsService.respondConnection(
      user.id,
      connectionId,
      ConnectionResponseAction.ACCEPT,
    );
  }

  @Post('connections/:id/decline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decline an incoming connection request with reason taxonomy' })
  async declineConnection(
    @CurrentUser() user: any,
    @Param('id') connectionId: string,
    @Body('declineReasonCode') declineReasonCode?: string,
    @Body('declineNote') declineNote?: string,
  ) {
    return this.connectionsService.respondConnection(
      user.id,
      connectionId,
      ConnectionResponseAction.DECLINE,
      declineReasonCode,
      declineNote,
    );
  }

  @Post('connections/:id/ignore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ignore an incoming connection request with reason' })
  async ignoreConnection(
    @CurrentUser() user: any,
    @Param('id') connectionId: string,
    @Body('reason') reason?: string,
  ) {
    return this.connectionsService.ignoreConnection(user.id, connectionId, reason);
  }

  @Get('connections/colleagues-for-handover')
  @ApiOperation({ summary: 'Feature #7: Retrieve verified organizational peers available for opportunity handover' })
  async getColleaguesForHandover(@CurrentUser() user: any) {
    return this.connectionsService.getColleaguesForHandover(user.id);
  }

  @Post('connections/:id/delegate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Feature #7: Smart Wrong-Contact Handover - Re-route or assign opportunity bridge to colleague' })
  async delegateConnection(
    @CurrentUser() user: any,
    @Param('id') connectionId: string,
    @Body('targetProfileId') targetProfileId?: string,
    @Body('colleagueProfileId') colleagueProfileId?: string,
    @Body('delegationNote') delegationNote?: string,
    @Body('internalMemo') internalMemo?: string,
    @Body('acceptAndConnect') acceptAndConnect?: boolean,
  ) {
    const effectiveProfileId = targetProfileId || colleagueProfileId;
    const effectiveNote = delegationNote || internalMemo;
    return this.connectionsService.delegateConnection(
      user.id,
      connectionId,
      effectiveProfileId!,
      effectiveNote,
      acceptAndConnect,
    );
  }

  @Post('connections/:id/follow-up')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Schedule a smart follow-up reminder for an opportunity' })
  async scheduleFollowUp(
    @CurrentUser() user: any,
    @Param('id') connectionId: string,
    @Body('followUpDate') followUpDate: string,
    @Body('reminderNote') reminderNote?: string,
  ) {
    return this.connectionsService.scheduleFollowUp(
      user.id,
      connectionId,
      new Date(followUpDate),
      reminderNote,
    );
  }

  @Post('connections/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an outgoing connection request' })
  async cancelConnection(
    @CurrentUser() user: any,
    @Param('id') connectionId: string,
  ) {
    return this.connectionsService.cancelConnection(user.id, connectionId);
  }

  @Post('connections/:id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Feature Gap 157: Graceful connection withdrawal with quota recovery' })
  async withdrawConnection(
    @CurrentUser() user: any,
    @Param('id') connectionId: string,
  ) {
    return this.connectionsService.withdrawConnection(user.id, connectionId);
  }

  @Post('connections/:id/remind')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Feature Gap 151 & 152: Anti-spam gentle reminder nudge with cadence enforcement' })
  async remindConnection(
    @CurrentUser() user: any,
    @Param('id') connectionId: string,
    @Body() dto?: RemindConnectionDto,
  ) {
    return this.connectionsService.remindConnection(user.id, connectionId, dto?.reminderNote);
  }

  @Post('connections/:id/clarify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Feature Gap 154: Targeted clarification request before acceptance or rejection' })
  async clarifyConnection(
    @CurrentUser() user: any,
    @Param('id') connectionId: string,
    @Body() dto: ClarifyConnectionDto,
  ) {
    return this.connectionsService.clarifyConnection(user.id, connectionId, dto.question);
  }

  @Post('connections/:id/answer-clarification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Feature Gap 154: Answer recipient clarification request' })
  async answerClarification(
    @CurrentUser() user: any,
    @Param('id') connectionId: string,
    @Body() dto: AnswerClarificationDto,
  ) {
    return this.connectionsService.answerClarification(user.id, connectionId, dto.answer);
  }

  @Post('connections/:id/respond')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generic response endpoint for connection requests' })
  async respondConnection(
    @CurrentUser() user: any,
    @Param('id') connectionId: string,
    @Body() dto: RespondConnectionDto,
  ) {
    return this.connectionsService.respondConnection(
      user.id,
      connectionId,
      dto.action,
      dto.declineReasonCode,
      dto.declineNote,
    );
  }

  @Post('connections/:id/disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect an active connection cleanly' })
  async disconnectConnection(
    @CurrentUser() user: any,
    @Param('id') connectionId: string,
  ) {
    return this.connectionsService.disconnectConnection(user.id, connectionId);
  }

  @Post('connections/by-profile/:profileId/disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect an active connection by target profile ID' })
  async disconnectByProfileId(
    @CurrentUser() user: any,
    @Param('profileId') profileId: string,
  ) {
    return this.connectionsService.disconnectByProfileId(user.id, profileId);
  }

  @Get('connections/network-metrics/:profileId')
  @ApiOperation({ summary: 'Get connection days, total connections tier (100+, 500+, 1000+) and mutual connections' })
  async getProfileNetworkMetrics(
    @CurrentUser() user: any,
    @Param('profileId') profileId: string,
  ) {
    return this.connectionsService.getProfileNetworkMetrics(user.id, profileId);
  }

  @Get('connections/mutual/:profileId')
  @ApiOperation({ summary: 'Get list of mutual connections with target decision maker profile' })
  async getMutualConnections(
    @CurrentUser() user: any,
    @Param('profileId') profileId: string,
  ) {
    return this.connectionsService.getMutualConnections(user.id, profileId);
  }

  // --- Warm Introductions Endpoints ---

  @Post(['introductions', 'connections/introductions'])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request an introduction to a target professional through an intermediary' })
  async requestIntroduction(
    @CurrentUser() user: any,
    @Body() dto: CreateIntroductionDto,
  ) {
    return this.connectionsService.requestIntroduction(user.id, dto);
  }

  @Get(['introductions', 'connections/introductions'])
  @ApiOperation({ summary: 'List all warm introductions related to current user' })
  async getIntroductions(@CurrentUser() user: any) {
    return this.connectionsService.getIntroductions(user.id);
  }

  @Post(['introductions/:id/respond', 'connections/introductions/:id/respond'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Respond to an introduction request (intermediary or target)' })
  async respondIntroduction(
    @CurrentUser() user: any,
    @Param('id') introId: string,
    @Body() dto: RespondIntroductionDto,
  ) {
    return this.connectionsService.respondIntroduction(user.id, introId, dto.action, dto.endorsementNote);
  }
}
