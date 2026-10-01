import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type AuthLimiter = typeof import('@shared/utils/rate-limit/authRateLimit');
let auth: AuthLimiter;
const start = 1_000;

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(start);
  auth = await import('@shared/utils/rate-limit/authRateLimit');
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Auth rate-limit behavior after relocation', () => {
  it('allows five login attempts per IP with the same remaining counts', () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      expect(auth.checkLoginRateLimit('203.0.113.1')).toEqual({
        allowed: true,
        remaining: 4 - attempt,
        resetAt: start + 15 * 60 * 1_000,
      });
    }
    expect(auth.checkLoginRateLimit('203.0.113.1').allowed).toBe(false);
    expect(auth.checkLoginRateLimit('198.51.100.2').allowed).toBe(true);
  });

  it('allows three password changes and keeps login counters separate', () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      expect(auth.checkPasswordChangeRateLimit('editor')).toEqual({
        allowed: true,
        remaining: 2 - attempt,
        resetAt: start + 60 * 60 * 1_000,
      });
    }
    expect(auth.checkPasswordChangeRateLimit('editor').allowed).toBe(false);
    expect(auth.checkPasswordChangeRateLimit('another-editor').allowed).toBe(
      true
    );
    expect(auth.checkLoginRateLimit('editor').remaining).toBe(4);
  });

  it.each([
    ['checkLoginRateLimit', 5, 15 * 60 * 1_000],
    ['checkPasswordChangeRateLimit', 3, 60 * 60 * 1_000],
  ] as const)(
    'preserves the strict reset boundary for %s',
    (method, limit, duration) => {
      for (let attempt = 0; attempt < limit; attempt++)
        auth[method]('same-key');
      vi.setSystemTime(start + duration);
      expect(auth[method]('same-key').allowed).toBe(false);
      vi.setSystemTime(start + duration + 1);
      expect(auth[method]('same-key')).toEqual({
        allowed: true,
        remaining: limit - 1,
        resetAt: start + duration * 2 + 1,
      });
    }
  );

  it('registers the existing five-minute cleanup timer only once', async () => {
    expect(vi.getTimerCount()).toBe(1);
    await import('@shared/utils/rate-limit/authRateLimit');
    expect(vi.getTimerCount()).toBe(1);
    auth.checkLoginRateLimit('203.0.113.1');
    vi.advanceTimersByTime(20 * 60 * 1_000);
    expect(auth.checkLoginRateLimit('203.0.113.1').remaining).toBe(4);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('does not share counters with the Contact limiter', async () => {
    const { createContactRateLimiter } =
      await import('@shared/utils/rate-limit/contactRateLimit');
    const contact = createContactRateLimiter();
    for (let attempt = 0; attempt < 5; attempt++)
      auth.checkLoginRateLimit('same-ip');
    expect(auth.checkLoginRateLimit('same-ip').allowed).toBe(false);
    for (let attempt = 0; attempt < 5; attempt++)
      expect(contact('same-ip', start)).toBe(true);
    expect(contact('same-ip', start)).toBe(false);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('keeps the existing client-IP header precedence and fallback', () => {
    expect(
      auth.getClientIP(
        new Request('https://example.com', {
          headers: {
            'x-forwarded-for': ' 203.0.113.1, 198.51.100.2',
            'x-real-ip': '192.0.2.1',
          },
        })
      )
    ).toBe('203.0.113.1');
    expect(
      auth.getClientIP(
        new Request('https://example.com', {
          headers: { 'x-real-ip': '192.0.2.1' },
        })
      )
    ).toBe('192.0.2.1');
    expect(auth.getClientIP(new Request('https://example.com'))).toBe(
      'unknown'
    );
  });
});
