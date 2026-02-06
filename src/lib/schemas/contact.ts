import { z } from 'zod';

const commonFields = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Please provide more details (at least 10 characters)"),
  phone: z.string().optional(),
};

const commercialSchema = z.object({
  ...commonFields,
  type: z.literal('commercial'),
  weddingDate: z.any().optional(), // Keep as optional any to satisfy type union in RHF common fields
  venue: z.string().optional(),
});

const weddingSchema = z.object({
  ...commonFields,
  type: z.literal('wedding'),
  weddingDate: z.coerce.date().refine((date) => !Number.isNaN(date.getTime()), "Invalid wedding date"),
  venue: z.string().min(2, "Venue is required"),
});

export const contactFormSchema = z.discriminatedUnion('type', [
  commercialSchema,
  weddingSchema,
]);

export type ContactFormValues = z.infer<typeof contactFormSchema>;
