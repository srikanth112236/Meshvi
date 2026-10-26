import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReputationService } from './reputation.service';
import { SubmitOutcomeDto } from './dto/submit-outcome.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalScopeGuard } from '../auth/guards/portal-scope.guard';
import { PortalScope } from '../auth/decorators/portal-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reputation Engine')
@Controller()
@UseGuards(JwtAuthGuard, PortalScopeGuard)
@PortalScope('CONSUMER')
@ApiBearerAuth()
export class ReputationController {
  constructor(private readonly reputationService: ReputationService) {}

  @Get('reputation/:profileId')
  @ApiOperation({ summary: 'F5: Get reputation score for a profile' })
  async getProfileReputation(@Param('profileId') profileId: string) {
    return this.reputationService.getProfileReputation(profileId);
  }

  @Post('reputation/outcomes/:dealRoomId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'F5: Submit outcome report for a deal room' })
  async submitOutcome(
    @CurrentUser() user: any,
    @Param('dealRoomId') dealRoomId: string,
    @Body() dto: SubmitOutcomeDto,
  ) {
    return this.reputationService.submitOutcome(user.id, dealRoomId, dto);
  }
}
