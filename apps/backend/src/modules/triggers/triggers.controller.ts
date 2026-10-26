import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TriggersService } from './triggers.service';
import { CreateTriggerDto } from './dto/create-trigger.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalScopeGuard } from '../auth/guards/portal-scope.guard';
import { PortalScope } from '../auth/decorators/portal-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Why Now Triggers')
@Controller()
@UseGuards(JwtAuthGuard, PortalScopeGuard)
@PortalScope('CONSUMER')
@ApiBearerAuth()
export class TriggersController {
  constructor(private readonly triggersService: TriggersService) {}

  @Get('triggers/company/:companyId')
  @ApiOperation({ summary: 'F3: Get Why Now trigger signals for a company' })
  async getCompanyTriggers(@Param('companyId') companyId: string) {
    return this.triggersService.getCompanyTriggers(companyId);
  }

  @Get('triggers/feed')
  @ApiOperation({ summary: 'F3: Get recent trigger signal feed across all companies' })
  async getRecentFeed() {
    return this.triggersService.getRecentTriggerFeed();
  }

  @Post('triggers/declare/:companyId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'F3: Company admin declares a business trigger signal' })
  async declareTrigger(
    @CurrentUser() user: any,
    @Param('companyId') companyId: string,
    @Body() dto: CreateTriggerDto,
  ) {
    return this.triggersService.declareTrigger(user.id, companyId, dto);
  }
}
