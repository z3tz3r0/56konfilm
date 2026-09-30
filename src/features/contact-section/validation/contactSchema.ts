import { z } from 'zod';

const commonFields = {
  name: z.string().min(2, 'Name must be at least 2 characters'),
  surname: z
    .string({ error: 'Please enter your surname.' })
    .trim()
    .min(1, 'Please enter your surname.'),
  email: z.email('Please enter a valid email address'),
  message: z
    .string()
    .min(10, 'Please provide more details (at least 10 characters)'),
  phone: z.string().optional(),
};

const commercialSchema = z.object({
  ...commonFields,
  type: z.literal('commercial'),
  weddingDate: z.date().optional(),
  venue: z.string().optional(),
});

const weddingSchema = z.object({
  ...commonFields,
  type: z.literal('wedding'),
  weddingDate: z.date({
    error: (issue) =>
      issue.input === undefined
        ? 'Please select your wedding date.'
        : 'Please select a valid wedding date.',
  }),
  venue: z.string().min(2, 'Venue is required'),
});

export const contactFormSchema = z.discriminatedUnion('type', [
  commercialSchema,
  weddingSchema,
]);

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// A calendar day has no timezone. Send it as YYYY-MM-DD so the server cannot
// shift the visitor's selected wedding date when running in another timezone.
export const contactSubmissionSchema = z.discriminatedUnion('type', [
  commercialSchema,
  weddingSchema.extend({ weddingDate: z.iso.date() }),
]);

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
