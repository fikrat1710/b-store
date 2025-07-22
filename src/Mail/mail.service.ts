import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtpEmail(to: string, otp: string, subject: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      html: `
        <p>Sizning OTP kodingiz: <strong>${otp}</strong></p>
        <p>Bu kod ${15} daqiqa davomida amal qiladi.</p>
      `,
    });
  }
}