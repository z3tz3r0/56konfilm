import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { contactConfig, sendContactInquiry, headersMock } = vi.hoisted(() => ({
  contactConfig: { CONTACT_EMAIL_ENABLED: false },
  sendContactInquiry: vi.fn(),
  headersMock: vi.fn(),
}));

vi.mock('@shared/config/env', () => ({ env: contactConfig }));
vi.mock('@services/emailService', async (importOriginal) => {
  const { EmailDeliveryStatus } =
    await importOriginal<typeof import('@services/emailService')>();
  return { EmailDeliveryStatus, EmailService: { sendContactInquiry } };
});
vi.mock('next/headers', () => ({ headers: headersMock }));

import { submitContactForm } from '@features/contact-section/actions';
import { EmailDeliveryStatus } from '@services/emailService';

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
    headersMock.mockReset();
    vi.stubEnv('VERCEL', '');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('never invokes delivery while disabled', async () => {
    const result = await submitContactForm(commercial);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('unavailable');
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
      sendContactInquiry.mockResolvedValue({
        status: EmailDeliveryStatus.Sent,
      });

      const result = await submitContactForm(inquiry);
      expect(result.success).toBe(true);
      expect(sendContactInquiry).toHaveBeenCalledExactlyOnceWith(inquiry, {
        token: undefined,
        ip: undefined,
      });
    }
  );

  it('derives a valid IP only from the Vercel header and passes the token', async () => {
    contactConfig.CONTACT_EMAIL_ENABLED = true;
    vi.stubEnv('VERCEL', '1');
    headersMock.mockResolvedValue(
      new Headers({
        'x-vercel-forwarded-for': '203.0.113.1, 198.51.100.2',
      })
    );
    sendContactInquiry.mockResolvedValue({
      status: EmailDeliveryStatus.VerificationFailed,
    });
    const result = await submitContactForm(commercial, 'visitor-token');
    expect(result.reason).toBe('verification');
    expect(sendContactInquiry).toHaveBeenCalledExactlyOnceWith(commercial, {
      token: 'visitor-token',
      ip: '203.0.113.1',
    });
  });

  it.each([
    EmailDeliveryStatus.RateLimited,
    EmailDeliveryStatus.VerificationFailed,
  ])('maps %s to a form-safe reason', async (status) => {
    contactConfig.CONTACT_EMAIL_ENABLED = true;
    sendContactInquiry.mockResolvedValue({ status });
    const result = await submitContactForm(commercial, 'token');
    expect(result.success).toBe(false);
    expect(result.reason).toBe(
      status === EmailDeliveryStatus.RateLimited ? 'rate-limit' : 'verification'
    );
  });

  it.each([EmailDeliveryStatus.Unconfirmed, EmailDeliveryStatus.Failed])(
    'never reports success on %s delivery',
    async (status) => {
      contactConfig.CONTACT_EMAIL_ENABLED = true;
      sendContactInquiry.mockResolvedValue({ status });
      const result = await submitContactForm(commercial);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/could not/i);
      expect(result.reason).toBe(
        status === EmailDeliveryStatus.Unconfirmed ? 'unconfirmed' : undefined
      );
    }
  );
});
