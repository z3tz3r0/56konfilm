import { describe, expect, it, vi } from 'vitest';
import { sendResendEmail } from '@shared/lib/integrations/resend';

const message = {
  from: 'website@example.com',
  to: 'owner@gmail.com',
  replyTo: 'visitor@example.com',
  subject: 'New inquiry',
  text: 'Hello',
};

describe('Resend adapter', () => {
  it('maps message fields and accepts only a returned email ID', async () => {
    const post = vi.fn().mockResolvedValue({ id: 'email_123' });
    await expect(sendResendEmail(post, 're_test_key', message)).resolves.toBe(
      'email_123'
    );
    expect(post).toHaveBeenCalledExactlyOnceWith(
      'https://api.resend.com/emails',
      {
        from: 'website@example.com',
        to: ['owner@gmail.com'],
        reply_to: 'visitor@example.com',
        subject: 'New inquiry',
        text: 'Hello',
      },
      {
        Authorization: 'Bearer re_test_key',
        'User-Agent': '56konfilm-contact',
      }
    );
  });

  it.each([null, {}, { id: '' }, { id: ' ' }, { id: 12 }])(
    'does not confirm a response without an email ID (%j)',
    async (response) => {
      const post = vi.fn().mockResolvedValue(response);
      await expect(sendResendEmail(post, 're_test_key', message)).resolves.toBe(
        null
      );
    }
  );

  it('propagates HTTP failures to the service', async () => {
    const post = vi.fn().mockRejectedValue(new Error('HTTP 429'));
    await expect(sendResendEmail(post, 're_test_key', message)).rejects.toThrow(
      /429/
    );
  });
});
