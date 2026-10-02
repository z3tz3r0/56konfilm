import { describe, expect, it } from 'vitest';
import { createContactRateLimiter } from '@shared/utils/rate-limit/contactRateLimit';

describe('temporary Contact RAM rate limit', () => {
  it('allows five attempts per IP in two minutes, then resets', () => {
    const check = createContactRateLimiter();
    for (let attempt = 0; attempt < 5; attempt++) {
      expect(check('203.0.113.1', 1_000 + attempt)).toBe(true);
    }
    expect(check('203.0.113.1', 5_000)).toBe(false);
    expect(check('198.51.100.2', 5_000)).toBe(true);
    expect(check('203.0.113.1', 121_000)).toBe(true);
  });

  it('skips only the RAM counter when no trusted IP is available', () => {
    const check = createContactRateLimiter();
    for (let attempt = 0; attempt < 10; attempt++) {
      expect(check(undefined, 1_000)).toBe(true);
    }
  });

  it('keeps independent limiter instances and resets at the exact boundary', () => {
    const first = createContactRateLimiter();
    const second = createContactRateLimiter();
    for (let attempt = 0; attempt < 5; attempt++) first('same-ip', 1_000);
    expect(first('same-ip', 120_999)).toBe(false);
    expect(second('same-ip', 120_999)).toBe(true);
    expect(first('same-ip', 121_000)).toBe(true);
  });

  it('preserves bounded tracking and expires stale entries on later requests', () => {
    const check = createContactRateLimiter();
    for (let index = 0; index < 10_000; index++) check(`ip-${index}`, 1_000);
    for (let attempt = 0; attempt < 6; attempt++)
      expect(check('overflow-ip', 2_000)).toBe(true);
    for (let attempt = 0; attempt < 5; attempt++)
      expect(check('new-window-ip', 121_000)).toBe(true);
    expect(check('new-window-ip', 121_000)).toBe(false);
  });
});
