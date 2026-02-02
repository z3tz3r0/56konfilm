import { test as base, expect } from '@playwright/test';

type SiteMode = 'production' | 'wedding';

interface SiteFixtures {
  setMode: (mode: SiteMode) => Promise<void>;
  siteMode: SiteMode;
}

export const test = base.extend<SiteFixtures>({
  // Custom fixture to set the site mode via cookies
  setMode: async ({ context, page }, use) => {
    const setModeFunc = async (mode: SiteMode) => {
      // Set for both localhost and 127.0.0.1 to be safe
      const domains = ['localhost', '127.0.0.1'];
      for (const domain of domains) {
        await context.addCookies([
          {
            name: 'mode',
            value: mode,
            domain: domain,
            path: '/',
            expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
          },
        ]);
      }
      // Also try to set via evaluation if on a page
      if (page.url() !== 'about:blank') {
        await page.evaluate((m) => {
          document.cookie = `mode=${m}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        }, mode);
      }
      await page.goto('/'); 
      // `networkidle` is flaky in Next dev (long-lived connections); prefer deterministic readiness.
      await page.waitForLoadState('domcontentloaded');
    };
    await use(setModeFunc);
  },

  // Persistent site mode fixture
  siteMode: async ({ page }, use) => {
    const html = page.locator('html');
    const className = await html.getAttribute('class');
    if (className?.includes('light')) {
      await use('wedding');
    } else {
      await use('production');
    }
  },
});

export { expect };
