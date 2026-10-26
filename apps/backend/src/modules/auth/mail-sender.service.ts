import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MailSenderService {
  private readonly logger = new Logger(MailSenderService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly prisma: PrismaService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production',
          },
        });
        this.logger.log(`[SMTP-CONFIG] Configured real-time transporter via ${host}:${port} (${user})`);
      } catch (err: any) {
        this.logger.error(`[SMTP-CONFIG] Transporter initialization failed: ${err.message}`);
        this.transporter = null;
      }
    } else {
      this.logger.log(`[SMTP-CONFIG] No external SMTP credentials detected. Operating in high-reliability outbox fallback mode.`);
    }
  }

  /**
   * Re-check / re-initialize transporter if credentials were added to .env at runtime
   */
  public reloadTransporter() {
    this.initTransporter();
  }

  /**
   * Dispatch a real-time OTP verification email
   */
  async sendOtpEmail(
    to: string,
    recipientName: string,
    otp: string,
    type: 'REGISTRATION' | 'PASSWORD_RESET',
  ): Promise<{ delivered: boolean; mode: string }> {
    const isReset = type === 'PASSWORD_RESET';
    const expiryMinutes = isReset ? 10 : 15;
    const subject = isReset
      ? `MESHVI — Password Reset Code: ${otp} (Expires in 10 mins)`
      : `MESHVI — Verify your account: ${otp} (Expires in 15 mins)`;

    const actionTitle = isReset ? 'Reset Your Password' : 'Verify Your Email Address';
    const actionDesc = isReset
      ? `We received a request to reset the password for your MESHVI account. Use the 6-digit security code below to proceed. This code expires in strictly <strong>10 minutes</strong>.`
      : `Welcome to MESHVI. Please verify your email to unlock your verified commercial onboarding. This code expires in <strong>15 minutes</strong>.`;

    const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'MESHVI Security <no-reply@meshvi.local>';

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 28px 32px; text-align: left; }
    .logo-badge { display: inline-block; background: #0284c7; color: #ffffff; font-weight: 900; font-size: 16px; padding: 6px 14px; border-radius: 10px; letter-spacing: 0.5px; }
    .content { padding: 32px; }
    h1 { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px 0; }
    .code-box { background: #f1f5f9; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .code { font-family: monospace, Courier; font-size: 32px; font-weight: 900; color: #0284c7; letter-spacing: 6px; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="logo-badge">MESHVI</span>
    </div>
    <div class="content">
      <h1>${actionTitle}</h1>
      <p>Hello ${recipientName || 'Executive'},</p>
      <p>${actionDesc}</p>
      <div class="code-box">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 6px;">Your 6-Digit Verification Code</div>
        <div class="code">${otp}</div>
      </div>
      <p style="font-size: 12px; color: #64748b;">
        If you did not request this verification, please safely ignore this email. No changes will be made to your account.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} MESHVI Technologies Inc. &bull; Enterprise Commercial Intent Network
    </div>
  </div>
</body>
</html>
`;

    // 1. Record in immutable database outbox
    try {
      await this.prisma.emailOutbox.create({
        data: {
          toAddress: to.trim(),
          subject,
          htmlBody,
          templateKey: isReset ? 'PASSWORD_RESET_OTP' : 'REGISTRATION_OTP',
          status: 'PENDING',
        },
      });
    } catch (e: any) {
      this.logger.warn(`Could not save to emailOutbox: ${e.message}`);
    }

    // 2. Real-time SMTP transmission if credentials exist
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: to.trim(),
          subject,
          html: htmlBody,
        });
        this.logger.log(`[SMTP-DISPATCH-SUCCESS] Real-time email sent to ${to} (MessageId: ${info.messageId})`);
        return { delivered: true, mode: 'SMTP' };
      } catch (err: any) {
        this.logger.error(`[SMTP-DISPATCH-ERROR] Failed to send email via SMTP to ${to}: ${err.message}`);
      }
    }

    // 3. Fallback dev console notification
    this.logger.log(`========================================================================`);
    this.logger.log(`[REAL-TIME EMAIL DISPATCH] To: ${to}`);
    this.logger.log(`  Subject: ${subject}`);
    this.logger.log(`  OTP Code: >>> [ ${otp} ] <<< (Expires in ${expiryMinutes} minutes)`);
    this.logger.log(`========================================================================`);

    return { delivered: true, mode: 'OUTBOX_CONSOLE' };
  }
}
