import type { ContactSubmission } from '@features/contact-section/validation';
import { env } from '@shared/config/env';
import { HttpBaseService } from '@shared/lib/http/httpBaseService';
import { sendResendEmail } from '@shared/lib/integrations/resend';
import { verifyTurnstileToken } from '@shared/lib/integrations/turnstile';
import { checkContactRateLimit } from '@shared/utils/contactRateLimit';

export enum EmailDeliveryStatus {
  Sent = 'sent',
  Unconfirmed = 'unconfirmed',
  Failed = 'failed',
  RateLimited = 'rate-limited',
  VerificationFailed = 'verification-failed',
}

export type EmailDeliveryResult = { status: EmailDeliveryStatus };

export class EmailService extends HttpBaseService {
  static async sendContactInquiry(
    inquiry: ContactSubmission,
    verification?: { token?: string | null; ip?: string }
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
      !env.CONTACT_EMAIL_TO ||
      !env.TURNSTILE_SECRET_KEY
    ) {
      return { status: EmailDeliveryStatus.Failed };
    }

    if (!checkContactRateLimit(verification?.ip)) {
      return { status: EmailDeliveryStatus.RateLimited };
    }

    const token = verification?.token?.trim();
    if (!token || token.length > 2048) {
      return { status: EmailDeliveryStatus.VerificationFailed };
    }

    try {
      const verified = await verifyTurnstileToken(
        this.post,
        env.TURNSTILE_SECRET_KEY,
        token,
        verification?.ip
      );
      if (!verified) return { status: EmailDeliveryStatus.VerificationFailed };
    } catch {
      console.error('[EmailService Error]: Turnstile verification failed.');
      return { status: EmailDeliveryStatus.VerificationFailed };
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
        return { status: EmailDeliveryStatus.Unconfirmed };
      }

      return { status: EmailDeliveryStatus.Sent };
    } catch {
      // Do not log the request, which includes private keys and visitor data.
      console.error('[EmailService Error]: Contact email delivery failed.');
      return { status: EmailDeliveryStatus.Failed };
    }
  }
}
