// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('contact email configuration', () => {
  it.each([' ', '\t', '\n', '\r\n'])(
    'exports validated credentials without surrounding whitespace: %j',
    async (whitespace) => {
      vi.stubEnv('CONTACT_EMAIL_ENABLED', 'true');
      vi.stubEnv('RESEND_API_KEY', `${whitespace}re_test_key${whitespace}`);
      vi.stubEnv('CONTACT_EMAIL_FROM', 'website@example.com');
      vi.stubEnv('CONTACT_EMAIL_TO', 'owner@gmail.com');
      vi.stubEnv(
        'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
        `${whitespace}test-site-key${whitespace}`
      );
      vi.stubEnv(
        'TURNSTILE_SECRET_KEY',
        `${whitespace}test-secret-key${whitespace}`
      );
      vi.resetModules();
      const { env } = await import('@shared/config/env');
      expect(env.RESEND_API_KEY).toBe('re_test_key');
      expect(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY).toBe('test-site-key');
      expect(env.TURNSTILE_SECRET_KEY).toBe('test-secret-key');
      expect(env.CONTACT_EMAIL_FROM).toBe('website@example.com');
      expect(env.CONTACT_EMAIL_TO).toBe('owner@gmail.com');
      expect(
        new Headers({ Authorization: `Bearer ${env.RESEND_API_KEY}` }).get(
          'Authorization'
        )
      ).toBe('Bearer re_test_key');
    }
  );

  it.each([
    'RESEND_API_KEY',
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
    'TURNSTILE_SECRET_KEY',
  ])('rejects %s that becomes empty after trimming', async (field) => {
    vi.stubEnv('CONTACT_EMAIL_ENABLED', 'true');
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubEnv('CONTACT_EMAIL_FROM', 'website@example.com');
    vi.stubEnv('CONTACT_EMAIL_TO', 'owner@gmail.com');
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'test-site-key');
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret-key');
    vi.stubEnv(field, ' \n\t ');
    vi.resetModules();
    await expect(import('@shared/config/env')).rejects.toThrow(field);
  });
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
    vi.stubEnv(
      'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
      ' \n1x00000000000000000000AA\t '
    );
    vi.stubEnv(
      'TURNSTILE_SECRET_KEY',
      ' \n1x0000000000000000000000000000000AA\t '
    );
    vi.resetModules();

    const { env } = await import('@shared/config/env');
    expect(env.CONTACT_EMAIL_ENABLED).toBe(true);
  });

  it.each(['', ' \n\t '])(
    'rejects official test keys with surrounding %j when production delivery is enabled',
    async (whitespace) => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'test-project');
      vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
      vi.stubEnv('NEXT_PUBLIC_SANITY_API_VERSION', '2025-08-12');
      vi.stubEnv('CONTACT_EMAIL_ENABLED', 'true');
      vi.stubEnv('RESEND_API_KEY', 're_test_key');
      vi.stubEnv('CONTACT_EMAIL_FROM', 'website@example.com');
      vi.stubEnv('CONTACT_EMAIL_TO', 'owner@gmail.com');
      vi.stubEnv(
        'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
        `${whitespace}1x00000000000000000000AA${whitespace}`
      );
      vi.stubEnv(
        'TURNSTILE_SECRET_KEY',
        `${whitespace}1x0000000000000000000000000000000AA${whitespace}`
      );
      vi.resetModules();

      await expect(import('@shared/config/env')).rejects.toThrow(
        /test keys cannot be used/
      );
    }
  );
});
