'use server';

import { contactFormSchema, ContactFormValues } from '@/lib/schemas/contact';

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const CONTACT_RECEIVER_EMAIL = '56konfilm@gmail.com';

export async function submitContactForm(data: ContactFormValues | unknown): Promise<ActionState> {
  const parsed = contactFormSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  const validData = parsed.data;

  // Simulate routing logic
  try {
    if (validData.type === 'commercial') {
      console.log(`[ROUTING] Commercial Inquiry -> ${CONTACT_RECEIVER_EMAIL}: ${validData.name}`);
      // In real implementation: await sendEmail(validData);
      return {
        success: true,
        message: 'Commercial Inquiry received. We will contact you shortly.',
      };
    } else if (validData.type === 'wedding') {
      console.log(`[ROUTING] Wedding Inquiry -> ${CONTACT_RECEIVER_EMAIL}: ${validData.name} - ${validData.weddingDate.toLocaleDateString()}`);
      // In real implementation: await sendEmail(validData);
      return {
        success: true,
        message: 'Love story received! We will be in touch soon.',
      };
    }
    
    // Fallback for exhaustive check
    return { success: false, message: 'Invalid form type' };

  } catch (error) {
    console.error('Submission error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    };
  }
}
