import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withContextPrefix } from '@shared/utils/url/contextUrl';
import { getBaseURL } from '@shared/utils/url/siteUrl';
import { derivePreferences } from '@shared/utils/preferences/derivePreferences';
import { sanitizePaginationLimit } from '@shared/utils/paginationUtils';
import { getBGVariants } from '@shared/utils/styling/styleVariants';
import { cn } from '@shared/utils/styling/tailwindUtils';

const { testEnv } = vi.hoisted(() => ({
  testEnv: {
    NEXT_PUBLIC_SITE_URL: undefined as string | undefined,
    PORT: 3000,
  },
}));

vi.mock('@shared/config', async () => ({
  ...(await import('@shared/config/preferences')),
  env: testEnv,
}));

beforeEach(() => {
  testEnv.NEXT_PUBLIC_SITE_URL = undefined;
  vi.stubEnv('VERCEL_URL', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('relocated URL helpers', () => {
  it.each([null, '', '/', 'home', '/home/'])(
    'preserves home handling for %s',
    (href) => {
      expect(withContextPrefix({ href, lang: 'th', mode: 'wedding' })).toBe(
        '/th/wedding'
      );
    }
  );

  it('removes edge slashes without changing the context prefix', () => {
    expect(
      withContextPrefix({
        href: '/portfolio/project/',
        lang: 'en',
        mode: 'production',
      })
    ).toBe('/en/production/portfolio/project');
  });

  it('prefers the configured site URL over the Vercel URL', () => {
    testEnv.NEXT_PUBLIC_SITE_URL = 'https://site.example.com';
    vi.stubEnv('VERCEL_URL', 'preview.example.com');
    expect(getBaseURL().origin).toBe('https://site.example.com');
  });

  it('uses the Vercel URL when no public site URL exists', () => {
    vi.stubEnv('VERCEL_URL', 'preview.example.com');
    expect(getBaseURL().origin).toBe('https://preview.example.com');
  });

  it('preserves the browser-origin fallback', () => {
    expect(getBaseURL().origin).toBe(window.location.origin);
  });

  it('uses the configured local port on the server', () => {
    vi.stubGlobal('window', undefined);
    expect(getBaseURL().origin).toBe('http://localhost:3000');
  });
});

describe('relocated preference resolution', () => {
  it('prefers valid URL values over cookies and browser language', () => {
    expect(
      derivePreferences({
        urlLocale: 'th',
        urlMode: 'wedding',
        cookieLocale: 'en',
        cookieMode: 'production',
        acceptLanguage: 'en-US',
      })
    ).toEqual({ locale: 'th', mode: 'wedding', shouldUpdateCookie: true });
  });

  it('falls back to valid cookies for unsupported URL values', () => {
    expect(
      derivePreferences({
        urlLocale: 'fr',
        urlMode: 'unknown',
        cookieLocale: 'th',
        cookieMode: 'wedding',
        acceptLanguage: 'en-US',
      })
    ).toEqual({ locale: 'th', mode: 'wedding', shouldUpdateCookie: true });
  });

  it('uses the first supported browser language after cookies', () => {
    expect(
      derivePreferences({
        cookieLocale: 'fr',
        cookieMode: 'unknown',
        acceptLanguage: 'de-DE;q=0.9, th-TH;q=0.8, en-US;q=0.7',
      })
    ).toMatchObject({ locale: 'th', mode: 'production' });
  });

  it('preserves defaults and the existing cookie-update decision', () => {
    expect(derivePreferences({})).toEqual({
      locale: 'en',
      mode: 'production',
      shouldUpdateCookie: false,
    });
    expect(derivePreferences({ acceptLanguage: 'fr-FR' }).locale).toBe('en');
    expect(
      derivePreferences({
        urlLocale: 'th',
        cookieLocale: 'th',
        urlMode: 'wedding',
        cookieMode: 'wedding',
      }).shouldUpdateCookie
    ).toBe(false);
  });
});

describe('direct pagination and styling helpers', () => {
  it.each(['6', 15, '30'])('retains allowed pagination limit %s', (limit) => {
    expect(sanitizePaginationLimit(limit)).toBe(String(limit));
  });

  it.each([undefined, null, '', 0, 100, 'invalid'])(
    'retains default pagination fallback for %s',
    (limit) => {
      expect(sanitizePaginationLimit(limit)).toBe('6');
      expect(sanitizePaginationLimit(limit, '15')).toBe('15');
    }
  );

  it('keeps class merging and existing background variants', () => {
    expect(cn('p-2', { 'p-4': true, hidden: false }, undefined)).toBe('p-4');
    expect(getBGVariants('muted')).toBe('bg-secondary');
    expect(getBGVariants('contrast')).toBe(
      'bg-primary text-primary-foreground'
    );
    expect(getBGVariants('unknown')).toBe('');
    expect(getBGVariants()).toBe('');
  });

  it('does not start Auth timers when importing client-safe utilities or Contact', async () => {
    const timer = vi.spyOn(globalThis, 'setInterval');
    vi.resetModules();
    try {
      await import('@shared/utils/styling/tailwindUtils');
      await import('@shared/utils/styling/styleVariants');
      await import('@shared/utils/url/contextUrl');
      await import('@shared/utils/url/googleMaps');
      await import('@shared/utils/preferences/preferenceGuards');
      await import('@shared/utils/performance/deviceTier');
      await import('@shared/utils/rate-limit/contactRateLimit');
      expect(timer).not.toHaveBeenCalled();
    } finally {
      timer.mockRestore();
    }
  });
});
