import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccountDeletionService } from './account-deletion.service';
import { RequestAccountDeletionDto } from './dto/request-deletion.dto';

@ApiTags('Account Deletion & Data Privacy Compliance')
@Controller('users')
export class AccountDeletionController {
  constructor(private readonly deletionService: AccountDeletionService) {}

  @Post('request-deletion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Public, unauthenticated account deletion request (Google Play Store compliance)',
    description:
      'Allows users to request complete account and data deletion from a web browser without authentication. Returns a generic success response to avoid email enumeration attacks.',
  })
  @ApiResponse({
    status: 200,
    description: 'Generic success response confirming the deletion request was registered.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or unacknowledged confirmation checkbox.',
  })
  async requestDeletion(@Body() dto: RequestAccountDeletionDto) {
    return this.deletionService.requestDeletion(dto);
  }
}
