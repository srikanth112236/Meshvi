import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Profiles & Onboarding')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile with experience and intents' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getMyProfile(@CurrentUser() user: any) {
    return this.profilesService.getMyProfile(user.id);
  }

  @Put('me/onboarding')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save or update multi-step professional onboarding' })
  @ApiResponse({ status: 200, description: 'Profile onboarding updated successfully' })
  async updateOnboarding(
    @CurrentUser() user: any,
    @Body() dto: UpdateOnboardingDto,
  ) {
    return this.profilesService.updateOnboarding(user.id, dto);
  }

  @Patch('me/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update active mode, connection availability, and proposal acceptance status' })
  async updateProfileStatus(
    @CurrentUser() user: any,
    @Body() body: {
      isActive?: boolean;
      connectionAvailability?: string;
      proposalAccepting?: boolean;
      visibility?: any;
    },
  ) {
    return this.profilesService.updateProfileStatus(user.id, body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get professional profile by ID with visibility checks' })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  @ApiResponse({ status: 403, description: 'Access forbidden due to visibility setting' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfileById(
    @Param('id') profileId: string,
    @CurrentUser() user: any,
  ) {
    return this.profilesService.getProfileById(profileId, user?.id);
  }

  @Post('me/intents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #17: Add commercial intent tag (OFFERING, LOOKING_FOR, NOT_LOOKING_FOR)' })
  async addIntentTag(
    @CurrentUser() user: any,
    @Body() body: { intentType: string; description: string },
  ) {
    return this.profilesService.addIntentTag(user.id, body.intentType, body.description);
  }

  @Delete('me/intents/:intentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #17: Remove commercial intent tag' })
  async deleteIntentTag(
    @CurrentUser() user: any,
    @Param('intentId') intentId: string,
  ) {
    return this.profilesService.deleteIntentTag(user.id, intentId);
  }

  @Post('me/expertise')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add specialized expertise tag' })
  async addExpertiseTag(
    @CurrentUser() user: any,
    @Body() body: { term: string },
  ) {
    return this.profilesService.addExpertiseTag(user.id, body.term);
  }

  @Delete('me/expertise/:termOrId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove specialized expertise tag' })
  async deleteExpertiseTag(
    @CurrentUser() user: any,
    @Param('termOrId') termOrId: string,
  ) {
    return this.profilesService.deleteExpertiseTag(user.id, termOrId);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload avatar image (base64) and store to disk' })
  async uploadAvatar(
    @CurrentUser() user: any,
    @Body() dto: UploadAvatarDto,
  ) {
    return this.profilesService.uploadAvatar(user.id, dto.dataUrl, dto.fileName);
  }
}
