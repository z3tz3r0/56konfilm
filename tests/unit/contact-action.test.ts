import { describe, expect, it } from 'vitest';
// @ts-ignore - Module does not exist yet
import { submitContactForm } from '@features/contact-section/actions';
import { ContactFormValues } from '@features/contact-section/validation';

describe('submitContactForm Server Action', () => {
  it.each(['commercial', 'wedding'])(
    'rejects a blank surname on the server for %s inquiries',
    async (type) => {
      const result = await submitContactForm({
        type,
        name: 'Example',
        surname: '   ',
        email: 'example@example.com',
        message: 'A detailed inquiry message',
        weddingDate: new Date(2050, 6, 21),
        venue: 'Example venue',
      });
      expect(result.success).toBe(false);
      expect(result.errors?.surname).toEqual(['Please enter your surname.']);
    }
  );
  it('should return error for invalid data', async () => {
    const invalidData = { type: 'commercial', name: 'A' }; // Short name
    const result = await submitContactForm(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should process commercial inquiry', async () => {
    const data: ContactFormValues = {
      type: 'commercial',
      name: 'Good Agency',
      surname: 'Example',
      email: 'test@agency.com',
      message: 'We want to hire you for a project.',
    };
    const result = await submitContactForm(data);
    expect(result.success).toBe(true);
    // Expect a message indicating successful commercial routing
    expect(result.message).toMatch(/Inquiry received/i);
  });

  it('should process wedding inquiry', async () => {
    const data: ContactFormValues = {
      type: 'wedding',
      name: 'Couple Love',
      surname: 'Example',
      email: 'love@test.com',
      message: 'Wedding help needed.',
      weddingDate: new Date('2025-01-01'),
      venue: 'Hotel',
    };
    const result = await submitContactForm(data);
    expect(result.success).toBe(true);
    // Expect a message indicating successful wedding routing
    expect(result.message).toMatch(/Love story received/i);
  });
});
