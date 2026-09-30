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
    vi.resetModules();

    const { env } = await import('@shared/config/env');
    expect(env.CONTACT_EMAIL_ENABLED).toBe(false);
  });

  it('fails fast with missing or invalid values when enabled', async () => {
    vi.stubEnv('CONTACT_EMAIL_ENABLED', 'true');
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('CONTACT_EMAIL_FROM', 'not-an-email');
    vi.stubEnv('CONTACT_EMAIL_TO', '');
    vi.resetModules();

    await expect(import('@shared/config/env')).rejects.toThrow(
      /RESEND_API_KEY, CONTACT_EMAIL_FROM, CONTACT_EMAIL_TO/
    );
  });

  it('accepts complete configuration when enabled', async () => {
    vi.stubEnv('CONTACT_EMAIL_ENABLED', 'true');
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubEnv('CONTACT_EMAIL_FROM', 'website@example.com');
    vi.stubEnv('CONTACT_EMAIL_TO', 'owner@gmail.com');
    vi.resetModules();

    const { env } = await import('@shared/config/env');
    expect(env.CONTACT_EMAIL_ENABLED).toBe(true);
  });
});
