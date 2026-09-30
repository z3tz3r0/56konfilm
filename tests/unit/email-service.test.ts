import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { emailConfig, sendResendEmail } = vi.hoisted(() => ({
  emailConfig: {
    CONTACT_EMAIL_ENABLED: true,
    RESEND_API_KEY: 're_test_key',
    CONTACT_EMAIL_FROM: 'website@example.com',
    CONTACT_EMAIL_TO: 'owner@gmail.com',
  },
  sendResendEmail: vi.fn(),
}));

vi.mock('@shared/config/env', () => ({ env: emailConfig }));
vi.mock('@shared/lib/integrations/resend', () => ({ sendResendEmail }));

import { EmailService } from '@services/emailService';

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
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it.each([commercial, wedding])(
    'composes a $type inquiry for the sole owner with visitor Reply-To',
    async (inquiry) => {
      sendResendEmail.mockResolvedValue('email_123');
      await expect(EmailService.sendContactInquiry(inquiry)).resolves.toEqual({
        status: 'sent',
      });
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
    await expect(EmailService.sendContactInquiry(commercial)).resolves.toEqual({
      status: 'failed',
    });
    expect(sendResendEmail).not.toHaveBeenCalled();
  });

  it('distinguishes an unconfirmed response from a failed request', async () => {
    sendResendEmail.mockResolvedValueOnce(null);
    await expect(EmailService.sendContactInquiry(commercial)).resolves.toEqual({
      status: 'unconfirmed',
    });
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      '[EmailService Error]: Resend returned no email ID.'
    );
    sendResendEmail.mockRejectedValueOnce(new Error('Timed out'));
    await expect(EmailService.sendContactInquiry(commercial)).resolves.toEqual({
      status: 'failed',
    });
    expect(console.error).toHaveBeenNthCalledWith(
      2,
      '[EmailService Error]: Contact email delivery failed.'
    );
  });
});
