import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly prisma: PrismaService) {}

  async submitContact(dto: CreateContactDto) {
    if (!dto.consent) {
      throw new BadRequestException('You must consent to the privacy policy to submit.');
    }

    this.logger.log(`Received contact enquiry from ${dto.email} [${dto.enquiryType}]`);

    // Log the contact inquiry in AuditLog
    await this.prisma.auditLog.create({
      data: {
        action: 'CONTACT_FORM_SUBMISSION',
        resource: 'CONTACT',
        metadata: JSON.stringify({
          name: dto.name,
          email: dto.email,
          company: dto.company || null,
          enquiryType: dto.enquiryType,
          messagePreview: dto.message.slice(0, 100),
        }),
      },
    });

    // Enqueue an acknowledgment into EmailOutbox
    await this.prisma.emailOutbox.create({
      data: {
        toAddress: dto.email,
        subject: `Thank you for contacting Project Setu - [${dto.enquiryType}]`,
        htmlBody: `<p>Hi ${dto.name},</p><p>We received your inquiry regarding "<strong>${dto.enquiryType}</strong>". Our team will review your message and get back to you shortly.</p><p>Best regards,<br/>The Project Setu Team</p>`,
        templateKey: 'CONTACT_ACKNOWLEDGMENT',
        status: 'PENDING',
      },
    });

    return {
      message: 'Thank you for getting in touch. Your message has been received.',
      enquiryType: dto.enquiryType,
      receivedAt: new Date().toISOString(),
    };
  }
}
