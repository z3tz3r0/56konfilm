import { z } from 'zod';
import type { Locale } from '@shared/config/preferences';
import { contactFormCopy } from '../formCopy';

function createContactSchemas(lang: Locale) {
  const copy = contactFormCopy[lang].validation;
  const commonFields = {
    name: z.string({ error: copy.name }).min(2, copy.name),
    surname: z.string({ error: copy.surname }).trim().min(1, copy.surname),
    email: z.email(copy.email),
    message: z.string({ error: copy.message }).min(10, copy.message),
    phone: z.string().optional(),
  };

  const commercialSchema = z.object({
    ...commonFields,
    type: z.literal('commercial'),
    weddingDate: z.date({ error: copy.weddingDateInvalid }).optional(),
    venue: z.string({ error: copy.venue }).optional(),
  });

  const weddingSchema = z.object({
    ...commonFields,
    type: z.literal('wedding'),
    weddingDate: z.date({
      error: (issue) =>
        issue.input === undefined
          ? copy.weddingDateRequired
          : copy.weddingDateInvalid,
    }),
    venue: z.string({ error: copy.venue }).min(2, copy.venue),
  });
  return { commercialSchema, weddingSchema };
}

// Locale-specific schemas stay inside Contact; do not change Zod's global locale.
export function createContactFormSchema(lang: Locale = 'en') {
  const { commercialSchema, weddingSchema } = createContactSchemas(lang);
  return z.discriminatedUnion('type', [commercialSchema, weddingSchema]);
}

export const contactFormSchema = createContactFormSchema();

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// A calendar day has no timezone. Send it as YYYY-MM-DD so the server cannot
// shift the visitor's selected wedding date when running in another timezone.
const { commercialSchema, weddingSchema } = createContactSchemas('en');
export const contactSubmissionSchema = z.discriminatedUnion('type', [
  commercialSchema,
  weddingSchema.extend({ weddingDate: z.iso.date() }),
]);

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
