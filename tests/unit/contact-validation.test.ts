import { describe, expect, it } from 'vitest';
// @ts-ignore - Module does not exist yet (Red Phase)
import { contactFormSchema } from '@features/contact-section/validation';
import { createContactFormSchema } from '@features/contact-section/validation/contactSchema';
import { contactFormCopy } from '@features/contact-section/formCopy';

describe('Contact Form Validation', () => {
  describe.each(['en', 'th'] as const)('localized %s validation', (lang) => {
    it.each(['commercial', 'wedding'] as const)(
      'localizes every visible field in %s without changing the rules',
      (type) => {
        const result = createContactFormSchema(lang).safeParse({
          type,
          name: '',
          surname: ' \n\t ',
          email: '',
          message: '',
          venue: '',
        });
        expect(result.success).toBe(false);
        if (result.success) return;
        const errors = result.error.flatten().fieldErrors;
        const copy = contactFormCopy[lang].validation;
        expect(errors).toMatchObject({
          name: [copy.name],
          surname: [copy.surname],
          email: [copy.email],
          message: [copy.message],
        });
        if (type === 'wedding') {
          expect(errors.weddingDate).toEqual([copy.weddingDateRequired]);
          expect(errors.venue).toEqual([copy.venue]);
        } else {
          expect(errors.weddingDate).toBeUndefined();
          expect(errors.venue).toBeUndefined();
        }
      }
    );

    it.each([null, '2050-07-21', new Date('invalid')])(
      'localizes an invalid wedding date: %s',
      (weddingDate) => {
        const result = createContactFormSchema(lang).safeParse({
          type: 'wedding',
          name: 'Example',
          surname: 'Family',
          email: 'visitor@example.com',
          message: 'A detailed inquiry',
          venue: 'Example venue',
          weddingDate,
        });
        expect(result.success).toBe(false);
        if (!result.success)
          expect(result.error.flatten().fieldErrors.weddingDate).toEqual([
            contactFormCopy[lang].validation.weddingDateInvalid,
          ]);
      }
    );
  });

  it('keeps English and Thai schemas independent and preserves valid values', () => {
    const thaiSchema = createContactFormSchema('th');
    const data = {
      type: 'commercial',
      name: 'AB',
      surname: '  ก  ',
      email: 'visitor@example.com',
      message: '1234567890',
    };
    expect(thaiSchema.parse(data)).toEqual({ ...data, surname: 'ก' });
    const invalid = { ...data, name: 'A', message: '123456789' };
    const thai = thaiSchema.safeParse(invalid);
    const english = contactFormSchema.safeParse(invalid);
    expect(thai.success).toBe(false);
    expect(english.success).toBe(false);
    if (!thai.success && !english.success) {
      expect(thai.error.flatten().fieldErrors.name).toEqual([
        'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร',
      ]);
      expect(english.error.flatten().fieldErrors.name).toEqual([
        'Name must be at least 2 characters',
      ]);
    }
  });
  describe.each(['commercial', 'wedding'] as const)(
    'surname in %s inquiries',
    (type) => {
      const validData = {
        type,
        name: 'Example',
        email: 'example@example.com',
        message: 'A detailed inquiry message',
        weddingDate: new Date(2050, 6, 21),
        venue: 'Example venue',
      };

      it.each([undefined, null, '', '   ', '\n\t'])(
        'rejects a missing or blank surname: %s',
        (surname) => {
          const result = contactFormSchema.safeParse({ ...validData, surname });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues).toContainEqual(
              expect.objectContaining({
                path: ['surname'],
                message: 'Please enter your surname.',
              })
            );
          }
        }
      );

      it('trims a valid surname without requiring multiple characters', () => {
        const result = contactFormSchema.safeParse({
          ...validData,
          surname: '  ก  ',
        });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.surname).toBe('ก');
      });
    }
  );
  it('should validate a valid commercial inquiry', () => {
    const validCommercial = {
      type: 'commercial',
      name: 'Agency X',
      surname: 'Example',
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
      surname: 'Example',
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
      surname: 'Example',
      email: 'couple@z.com',
      message: 'This is a detailed message about our big day.',
      weddingDate: new Date('2025-12-25'),
      venue: 'Grand Hall',
    };
    const result = contactFormSchema.safeParse(validWedding);
    if (!result.success) console.error(JSON.stringify(result.error, null, 2));
    expect(result.success).toBe(true);
  });

  it.each([
    [undefined, 'Please select your wedding date.'],
    [null, 'Please select a valid wedding date.'],
    ['2050-07-21', 'Please select a valid wedding date.'],
    [new Date('invalid'), 'Please select a valid wedding date.'],
  ])('returns a friendly wedding date error for %s', (weddingDate, message) => {
    const result = contactFormSchema.safeParse({
      type: 'wedding',
      name: 'Example couple',
      surname: 'Example',
      email: 'example@example.com',
      message: 'A detailed wedding inquiry',
      venue: 'Example venue',
      weddingDate,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.find((issue) => issue.path[0] === 'weddingDate')
          ?.message
      ).toBe(message);
    }
  });
});
