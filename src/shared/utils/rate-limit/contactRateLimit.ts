const LIMIT = 5;
const WINDOW_MS = 2 * 60 * 1000;
const MAX_TRACKED_IPS = 10_000;

type Entry = { count: number; resetAt: number };

export function createContactRateLimiter() {
  const attempts = new Map<string, Entry>();

  return (ip?: string, now = Date.now()): boolean => {
    if (!ip) return true;

    const existing = attempts.get(ip);
    if (existing && now < existing.resetAt) {
      if (existing.count >= LIMIT) return false;
      existing.count += 1;
      return true;
    }

    attempts.delete(ip);
    // This temporary guard lives in one Vercel Function instance. Its counters
    // are not shared, so it cannot guarantee protection from spam. If bots hit
    // the form or email usage spikes, consider Vercel WAF Rate Limiting and
    // check its cost before enabling it.
    for (const [key, entry] of attempts) {
      if (now >= entry.resetAt) attempts.delete(key);
    }
    if (attempts.size >= MAX_TRACKED_IPS) return true;

    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  };
}

export const checkContactRateLimit = createContactRateLimiter();
