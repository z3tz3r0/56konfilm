import type { ContactSubmission } from '@features/contact-section/validation';
import { env } from '@shared/config/env';
import { HttpBaseService } from '@shared/lib/http/httpBaseService';
import { sendResendEmail } from '@shared/lib/integrations/resend';

export type EmailDeliveryResult =
  | { status: 'sent' }
  | { status: 'unconfirmed' }
  | { status: 'failed' };

export class EmailService extends HttpBaseService {
  static async sendContactInquiry(
    inquiry: ContactSubmission
  ): Promise<EmailDeliveryResult> {
    const subject =
      inquiry.type === 'wedding'
        ? 'New wedding inquiry from the website'
        : 'New commercial inquiry from the website';
    const text = [
      `Inquiry type: ${inquiry.type}`,
      `Name: ${inquiry.name} ${inquiry.surname}`,
      `Email: ${inquiry.email}`,
      ...(inquiry.phone ? [`Phone: ${inquiry.phone}`] : []),
      ...(inquiry.type === 'wedding'
        ? [`Wedding date: ${inquiry.weddingDate}`, `Venue: ${inquiry.venue}`]
        : []),
      '',
      'Message:',
      inquiry.message,
    ].join('\n');

    // env.ts validates these private values before enabled delivery can run.
    if (
      !env.CONTACT_EMAIL_ENABLED ||
      !env.RESEND_API_KEY ||
      !env.CONTACT_EMAIL_FROM ||
      !env.CONTACT_EMAIL_TO
    ) {
      return { status: 'failed' };
    }

    try {
      const emailId = await sendResendEmail(this.post, env.RESEND_API_KEY, {
        from: env.CONTACT_EMAIL_FROM,
        to: env.CONTACT_EMAIL_TO,
        replyTo: inquiry.email,
        subject,
        text,
      });

      if (!emailId) {
        console.error('[EmailService Error]: Resend returned no email ID.');
        return { status: 'unconfirmed' };
      }

      return { status: 'sent' };
    } catch {
      // Do not log the request, which includes private keys and visitor data.
      console.error('[EmailService Error]: Contact email delivery failed.');
      return { status: 'failed' };
    }
  }
}
