import { describe, expect, it } from 'vitest';
// @ts-ignore - Module does not exist yet (Red Phase)
import { contactFormSchema } from '@/lib/schemas/contact';

describe('Contact Form Validation', () => {
  it('should validate a valid commercial inquiry', () => {
    const validCommercial = {
      type: 'commercial',
      name: 'Agency X',
      email: 'contact@agency.com',
      message: 'We need a commercial video production.',
      // Should NOT require wedding fields
    };
    const result = contactFormSchema.safeParse(validCommercial);
    if (!result.success) console.error(JSON.stringify(result.error, null, 2));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('commercial');
    }
  });

  it('should require wedding fields for wedding inquiry', () => {
    const invalidWedding = {
      type: 'wedding',
      name: 'Couple Y',
      email: 'love@couple.com',
      message: 'We are looking for a wedding photographer.',
      // Missing date and venue
    };
    const result = contactFormSchema.safeParse(invalidWedding);
    expect(result.success).toBe(false);
    if (!result.success) {
        const errorFields = result.error.issues.map((e: any) => e.path[0]);
        expect(errorFields).toContain('weddingDate');
        expect(errorFields).toContain('venue');
    }
  });

  it('should validate a valid wedding inquiry', () => {
    const validWedding = {
        type: 'wedding',
        name: 'Couple Z',
        email: 'couple@z.com',
        message: 'This is a detailed message about our big day.',
        weddingDate: new Date('2025-12-25'),
        venue: 'Grand Hall'
    };
    const result = contactFormSchema.safeParse(validWedding);
    if (!result.success) console.error(JSON.stringify(result.error, null, 2));
    expect(result.success).toBe(true);
  });
});
