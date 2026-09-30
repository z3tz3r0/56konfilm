import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  emailConfig,
  sendResendEmail,
  verifyTurnstileToken,
  checkContactRateLimit,
} = vi.hoisted(() => ({
  emailConfig: {
    CONTACT_EMAIL_ENABLED: true,
    RESEND_API_KEY: 're_test_key',
    CONTACT_EMAIL_FROM: 'website@example.com',
    CONTACT_EMAIL_TO: 'owner@gmail.com',
    TURNSTILE_SECRET_KEY: 'test-secret',
  },
  sendResendEmail: vi.fn(),
  verifyTurnstileToken: vi.fn(),
  checkContactRateLimit: vi.fn(),
}));

vi.mock('@shared/config/env', () => ({ env: emailConfig }));
vi.mock('@shared/lib/integrations/resend', () => ({ sendResendEmail }));
vi.mock('@shared/lib/integrations/turnstile', () => ({ verifyTurnstileToken }));
vi.mock('@shared/utils/contactRateLimit', () => ({
  checkContactRateLimit,
}));

import { EmailDeliveryStatus, EmailService } from '@services/emailService';

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

describe('EmailService', () => {
  beforeEach(() => {
    emailConfig.CONTACT_EMAIL_ENABLED = true;
    sendResendEmail.mockReset();
    verifyTurnstileToken.mockReset().mockResolvedValue(true);
    checkContactRateLimit.mockReset().mockReturnValue(true);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it.each([commercial, wedding])(
    'composes a $type inquiry for the sole owner with visitor Reply-To',
    async (inquiry) => {
      sendResendEmail.mockResolvedValue('email_123');
      await expect(
        EmailService.sendContactInquiry(inquiry, { token: 'valid' })
      ).resolves.toEqual({
        status: EmailDeliveryStatus.Sent,
      });
      expect(checkContactRateLimit).toHaveBeenCalledOnce();
      expect(verifyTurnstileToken).toHaveBeenCalledOnce();
      const [, key, message] = sendResendEmail.mock.calls[0];
      expect(key).toBe('re_test_key');
      expect(message).toMatchObject({
        from: 'website@example.com',
        to: 'owner@gmail.com',
        replyTo: 'visitor@example.com',
      });
      expect(message.subject).toContain(inquiry.type);
      expect(message.text).toContain('Name: Good Agency Example');
      if (inquiry.type === 'wedding') {
        expect(message.text).toContain('Wedding date: 2050-07-21');
        expect(message.text).toContain('Venue: Example venue');
      } else {
        expect(message.text).not.toContain('Wedding date:');
      }
    }
  );

  it('does not send when delivery is disabled', async () => {
    emailConfig.CONTACT_EMAIL_ENABLED = false;
    await expect(
      EmailService.sendContactInquiry(commercial, { token: 'valid' })
    ).resolves.toEqual({
      status: EmailDeliveryStatus.Failed,
    });
    expect(sendResendEmail).not.toHaveBeenCalled();
  });

  it('distinguishes an unconfirmed response from a failed request', async () => {
    sendResendEmail.mockResolvedValueOnce(null);
    await expect(
      EmailService.sendContactInquiry(commercial, { token: 'valid' })
    ).resolves.toEqual({
      status: EmailDeliveryStatus.Unconfirmed,
    });
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      '[EmailService Error]: Resend returned no email ID.'
    );
    sendResendEmail.mockRejectedValueOnce(new Error('Timed out'));
    await expect(
      EmailService.sendContactInquiry(commercial, { token: 'valid' })
    ).resolves.toEqual({
      status: EmailDeliveryStatus.Failed,
    });
    expect(console.error).toHaveBeenNthCalledWith(
      2,
      '[EmailService Error]: Contact email delivery failed.'
    );
  });

  it('checks the rate limit before verification and never sends a rejected inquiry', async () => {
    checkContactRateLimit.mockReturnValue(false);
    await expect(
      EmailService.sendContactInquiry(commercial, {
        token: 'valid',
        ip: '203.0.113.1',
      })
    ).resolves.toEqual({ status: EmailDeliveryStatus.RateLimited });
    expect(checkContactRateLimit).toHaveBeenCalledWith('203.0.113.1');
    expect(verifyTurnstileToken).not.toHaveBeenCalled();
    expect(sendResendEmail).not.toHaveBeenCalled();
  });

  it.each([null, '', 'x'.repeat(2049)])(
    'rejects a missing or oversized token',
    async (token) => {
      await expect(
        EmailService.sendContactInquiry(commercial, { token })
      ).resolves.toEqual({ status: EmailDeliveryStatus.VerificationFailed });
      expect(verifyTurnstileToken).not.toHaveBeenCalled();
      expect(sendResendEmail).not.toHaveBeenCalled();
    }
  );

  it('does not send after Siteverify rejects or times out', async () => {
    verifyTurnstileToken.mockResolvedValueOnce(false);
    await expect(
      EmailService.sendContactInquiry(commercial, { token: 'expired' })
    ).resolves.toEqual({ status: EmailDeliveryStatus.VerificationFailed });
    verifyTurnstileToken.mockRejectedValueOnce(new Error('Timed out'));
    await expect(
      EmailService.sendContactInquiry(commercial, { token: 'retry' })
    ).resolves.toEqual({ status: EmailDeliveryStatus.VerificationFailed });
    expect(sendResendEmail).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      '[EmailService Error]: Turnstile verification failed.'
    );
  });
});
