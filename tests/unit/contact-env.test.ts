// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('contact email configuration', () => {
  it('starts disabled without Resend settings', async () => {
    vi.stubEnv('CONTACT_EMAIL_ENABLED', 'false');
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('CONTACT_EMAIL_FROM', '');
    vi.stubEnv('CONTACT_EMAIL_TO', '');
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '');
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    vi.resetModules();

    const { env } = await import('@shared/config/env');
    expect(env.CONTACT_EMAIL_ENABLED).toBe(false);
  });

  it('fails fast with missing or invalid values when enabled', async () => {
    vi.stubEnv('CONTACT_EMAIL_ENABLED', 'true');
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('CONTACT_EMAIL_FROM', 'not-an-email');
    vi.stubEnv('CONTACT_EMAIL_TO', '');
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '');
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    vi.resetModules();

    await expect(import('@shared/config/env')).rejects.toThrow(
      /RESEND_API_KEY, CONTACT_EMAIL_FROM, CONTACT_EMAIL_TO, NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY/
    );
  });

  it('accepts complete configuration when enabled', async () => {
    vi.stubEnv('CONTACT_EMAIL_ENABLED', 'true');
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubEnv('CONTACT_EMAIL_FROM', 'website@example.com');
    vi.stubEnv('CONTACT_EMAIL_TO', 'owner@gmail.com');
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '1x00000000000000000000AA');
    vi.stubEnv('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA');
    vi.resetModules();

    const { env } = await import('@shared/config/env');
    expect(env.CONTACT_EMAIL_ENABLED).toBe(true);
  });

  it('rejects official test keys when production delivery is enabled', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'test-project');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    vi.stubEnv('NEXT_PUBLIC_SANITY_API_VERSION', '2025-08-12');
    vi.stubEnv('CONTACT_EMAIL_ENABLED', 'true');
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubEnv('CONTACT_EMAIL_FROM', 'website@example.com');
    vi.stubEnv('CONTACT_EMAIL_TO', 'owner@gmail.com');
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '1x00000000000000000000AA');
    vi.stubEnv('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA');
    vi.resetModules();

    await expect(import('@shared/config/env')).rejects.toThrow(
      /test keys cannot be used/
    );
  });
});
