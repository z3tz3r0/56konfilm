import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { contactConfig, sendContactInquiry } = vi.hoisted(() => ({
  contactConfig: { CONTACT_EMAIL_ENABLED: false },
  sendContactInquiry: vi.fn(),
}));

vi.mock('@shared/config/env', () => ({ env: contactConfig }));
vi.mock('@services/emailService', () => ({
  EmailService: { sendContactInquiry },
}));

import { submitContactForm } from '@features/contact-section/actions';

const commercial = {
  type: 'commercial' as const,
  name: 'Good Agency',
  surname: 'Example',
  email: 'visitor@example.com',
  message: 'We want to hire you for a project.',
};

const wedding = {
  ...commercial,
  type: 'wedding' as const,
  weddingDate: '2050-07-21',
  venue: 'Example venue',
};

describe('submitContactForm Server Action', () => {
  beforeEach(() => {
    contactConfig.CONTACT_EMAIL_ENABLED = false;
    sendContactInquiry.mockReset();
  });

  afterEach(() => vi.restoreAllMocks());

  it('never invokes delivery while disabled', async () => {
    const result = await submitContactForm(commercial);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not available/i);
    expect(sendContactInquiry).not.toHaveBeenCalled();
  });

  it.each(['commercial', 'wedding'] as const)(
    'rejects a blank surname before delivery for %s inquiries',
    async (type) => {
      contactConfig.CONTACT_EMAIL_ENABLED = true;
      const result = await submitContactForm({
        ...(type === 'wedding' ? wedding : commercial),
        surname: '   ',
      });
      expect(result.success).toBe(false);
      expect(result.errors?.surname).toEqual(['Please enter your surname.']);
      expect(sendContactInquiry).not.toHaveBeenCalled();
    }
  );

  it('rejects invalid data before delivery', async () => {
    contactConfig.CONTACT_EMAIL_ENABLED = true;
    const result = await submitContactForm({ ...commercial, name: 'A' });
    expect(result.success).toBe(false);
    expect(result.errors?.name).toBeDefined();
    expect(sendContactInquiry).not.toHaveBeenCalled();
  });

  it.each([commercial, wedding])(
    'passes validated $type data to the service and reports accepted delivery',
    async (inquiry) => {
      contactConfig.CONTACT_EMAIL_ENABLED = true;
      sendContactInquiry.mockResolvedValue({ status: 'sent' });

      const result = await submitContactForm(inquiry);
      expect(result.success).toBe(true);
      expect(sendContactInquiry).toHaveBeenCalledExactlyOnceWith(inquiry);
    }
  );

  it.each(['unconfirmed', 'failed'] as const)(
    'never reports success on %s delivery',
    async (status) => {
      contactConfig.CONTACT_EMAIL_ENABLED = true;
      sendContactInquiry.mockResolvedValue({ status });
      const result = await submitContactForm(commercial);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/could not/i);
    }
  );
});
