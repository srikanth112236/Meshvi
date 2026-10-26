import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { InterpretIntentDto } from './dto/interpret-intent.dto';
import { ValidateMandateDto } from './dto/validate-mandate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('AI & Query Intelligence')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('validate-mandate')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Validate partnership mandate against commercial criteria & guardrails' })
  @ApiResponse({ status: 200, description: 'Mandate compliance evaluation and suggestions' })
  async validateMandate(
    @CurrentUser() user: any,
    @Body() dto: ValidateMandateDto,
  ) {
    return this.aiService.validatePartnershipMandate(user?.id, dto);
  }

  @Post('interpret-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Interpret natural language query into structured criteria' })
  @ApiResponse({ status: 200, description: 'Intent interpreted with schema validation' })
  async interpret(
    @CurrentUser() user: any,
    @Body() dto: InterpretIntentDto,
  ) {
    return this.aiService.interpretIntent(user?.id, dto.query);
  }

  @Post('generate-pitch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate high-trust AI connection message pitch' })
  async generatePitch(
    @CurrentUser() user: any,
    @Body() body: { targetTitle: string; targetCompany: string; objective: string; tone?: string },
  ) {
    return this.aiService.generatePitch(user?.id, body);
  }

  @Post('sandbox')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Super Admin AI query simulator and latency diagnostic' })
  async runSandbox(
    @Body() body: { query: string; providerOverride?: string },
  ) {
    return this.aiService.runSandboxTest(body.query, body.providerOverride);
  }
}
