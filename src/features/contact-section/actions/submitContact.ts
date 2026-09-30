'use server';

import { env } from '@shared/config/env';
import { EmailService } from '@services/emailService';
import {
  contactSubmissionSchema,
  type ContactSubmission,
} from '@features/contact-section/validation';

type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitContactForm(
  data: ContactSubmission | unknown
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
  const delivery = await EmailService.sendContactInquiry(inquiry);

  if (delivery.status === 'sent') {
    return {
      success: true,
      message:
        inquiry.type === 'wedding'
          ? 'Love story received! We will be in touch soon.'
          : 'Commercial Inquiry received. We will contact you shortly.',
    };
  }

  if (delivery.status === 'unconfirmed') {
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
