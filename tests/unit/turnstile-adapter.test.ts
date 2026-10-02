import { describe, expect, it, vi } from 'vitest';
import { verifyTurnstileToken } from '@shared/lib/integrations/turnstile';

describe('Turnstile adapter', () => {
  it('sends token, secret and an optional IP to Siteverify', async () => {
    const post = vi.fn().mockResolvedValue({ success: true });
    await expect(
      verifyTurnstileToken(post, 'secret', 'token', '203.0.113.1')
    ).resolves.toBe(true);
    expect(post).toHaveBeenCalledExactlyOnceWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { secret: 'secret', response: 'token', remoteip: '203.0.113.1' }
    );
  });

  it.each([
    null,
    {},
    { success: false, 'error-codes': ['timeout-or-duplicate'] },
  ])('rejects invalid and replayed verification results', async (result) => {
    const post = vi.fn().mockResolvedValue(result);
    await expect(verifyTurnstileToken(post, 'secret', 'token')).resolves.toBe(
      false
    );
    expect(post).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { secret: 'secret', response: 'token' }
    );
  });

  it('propagates transport failures to EmailService', async () => {
    const post = vi.fn().mockRejectedValue(new Error('timeout'));
    await expect(verifyTurnstileToken(post, 'secret', 'token')).rejects.toThrow(
      'timeout'
    );
  });
});
