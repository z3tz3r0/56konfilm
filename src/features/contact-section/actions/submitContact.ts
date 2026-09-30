'use server';

import { env } from '@shared/config/env';
import { EmailDeliveryStatus, EmailService } from '@services/emailService';
import { headers } from 'next/headers';
import { isIP } from 'node:net';
import {
  contactSubmissionSchema,
  type ContactSubmission,
} from '@features/contact-section/validation';

type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  reason?: 'rate-limit' | 'verification';
};

async function getVerifiedContactIp(): Promise<string | undefined> {
  if (process.env.VERCEL !== '1') return undefined;
  const value = (await headers()).get('x-vercel-forwarded-for');
  const ip = value?.split(',')[0]?.trim();
  return ip && isIP(ip) ? ip : undefined;
}

export async function submitContactForm(
  data: ContactSubmission | unknown,
  turnstileToken?: string | null
): Promise<ActionState> {
  if (!env.CONTACT_EMAIL_ENABLED) {
    return {
      success: false,
      message:
        'Email inquiries are not available yet. Please use the contact details on this page.',
    };
  }

  const parsed = contactSubmissionSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  const inquiry = parsed.data;
  const ip = await getVerifiedContactIp();
  const delivery = await EmailService.sendContactInquiry(inquiry, {
    token: turnstileToken,
    ip,
  });

  if (delivery.status === EmailDeliveryStatus.RateLimited) {
    return {
      success: false,
      reason: 'rate-limit',
      message: 'Too many attempts. Please wait two minutes and try again.',
    };
  }

  if (delivery.status === EmailDeliveryStatus.VerificationFailed) {
    return {
      success: false,
      reason: 'verification',
      message: 'Verification failed. Please try again.',
    };
  }

  if (delivery.status === EmailDeliveryStatus.Sent) {
    return {
      success: true,
      message:
        inquiry.type === 'wedding'
          ? 'Love story received! We will be in touch soon.'
          : 'Commercial Inquiry received. We will contact you shortly.',
    };
  }

  if (delivery.status === EmailDeliveryStatus.Unconfirmed) {
    return {
      success: false,
      message:
        'We could not confirm your message was sent. Please contact us directly.',
    };
  }

  return {
    success: false,
    message: 'We could not send your message. Please try again later.',
  };
}
