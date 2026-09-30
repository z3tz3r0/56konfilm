import { describe, expect, it } from 'vitest';
import { createContactRateLimiter } from '@shared/utils/contactRateLimit';

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
});
