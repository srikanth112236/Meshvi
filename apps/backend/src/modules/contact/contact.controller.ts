import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@ApiTags('Public & Inquiries')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a contact or business enquiry' })
  @ApiResponse({ status: 200, description: 'Enquiry submitted successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or missing consent' })
  async submit(@Body() dto: CreateContactDto) {
    return this.contactService.submitContact(dto);
  }
}
