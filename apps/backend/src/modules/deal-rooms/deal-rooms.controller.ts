import { Controller, Get, Patch, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DealRoomsService } from './deal-rooms.service';
import { UpdateDealRoomDto } from './dto/update-deal-room.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { RecordOutcomeDto } from './dto/record-outcome.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalScopeGuard } from '../auth/guards/portal-scope.guard';
import { PortalScope } from '../auth/decorators/portal-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DealOutcomeType } from '@prisma/client';

@ApiTags('Deal Rooms')
@Controller()
@UseGuards(JwtAuthGuard, PortalScopeGuard)
@PortalScope('CONSUMER', 'COMPANY_ADMIN')
@ApiBearerAuth()
export class DealRoomsController {
  constructor(private readonly dealRoomsService: DealRoomsService) {}

  @Get('deal-rooms')
  @ApiOperation({ summary: 'F4: List all my deal rooms' })
  async getMyDealRooms(@CurrentUser() user: any) { return this.dealRoomsService.getMyDealRooms(user.id); }

  @Get('deal-rooms/trust-path/:targetProfileId')
  @ApiOperation({ summary: 'F2: Warm trust path to target profile (1-hop)' })
  async getTrustPath(@CurrentUser() user: any, @Param('targetProfileId') targetProfileId: string) {
    return this.dealRoomsService.getTrustPath(user.id, targetProfileId);
  }

  @Get('deal-rooms/:id')
  @ApiOperation({ summary: 'F4: Get a specific deal room' })
  async getDealRoom(@CurrentUser() user: any, @Param('id') id: string) { return this.dealRoomsService.getDealRoom(user.id, id); }

  @Patch('deal-rooms/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'F4: Update deal room goals/status' })
  async updateDealRoom(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateDealRoomDto) {
    return this.dealRoomsService.updateDealRoom(user.id, id, dto);
  }

  @Post('deal-rooms/:id/milestones')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'F4: Add a milestone' })
  async addMilestone(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: CreateMilestoneDto) {
    return this.dealRoomsService.addMilestone(user.id, id, dto);
  }

  @Patch('deal-rooms/:id/milestones/:milestoneId/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'F4: Toggle milestone completion' })
  async toggleMilestone(@CurrentUser() user: any, @Param('id') id: string, @Param('milestoneId') milestoneId: string) {
    return this.dealRoomsService.toggleMilestone(user.id, id, milestoneId);
  }

  @Post('deal-rooms/:id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'F4: Close deal room with outcome' })
  async closeDealRoom(@CurrentUser() user: any, @Param('id') id: string, @Body('outcome') outcome: DealOutcomeType) {
    return this.dealRoomsService.closeDealRoom(user.id, id, outcome);
  }

  @Post('deal-rooms/:id/sign-mnda')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute cryptographic Mutual Non-Disclosure Agreement (mNDA)' })
  async signMnda(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { signerName: string; legalEntity: string },
  ) {
    return this.dealRoomsService.signMnda(user.id, id, body);
  }

  @Get('deal-rooms/:id/outcome')
  @ApiOperation({ summary: 'Get bilateral partnership outcome and cryptographic attribution events' })
  async getOutcome(@CurrentUser() user: any, @Param('id') id: string) {
    return this.dealRoomsService.getPartnershipOutcome(user.id, id);
  }

  @Post('deal-rooms/:id/outcome')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record bilateral partnership outcome & reciprocal rating (Gaps 114, 119)' })
  async recordOutcome(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RecordOutcomeDto,
  ) {
    return this.dealRoomsService.recordPartnershipOutcome(user.id, id, dto);
  }
}

