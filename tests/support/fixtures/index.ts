import { test as base, expect } from '@playwright/test';

type SiteMode = 'production' | 'wedding';

interface SiteFixtures {
  setMode: (mode: SiteMode) => Promise<void>;
  siteMode: SiteMode;
}

export const test = base.extend<SiteFixtures>({
  // Custom fixture to set the site mode via cookies
  setMode: async ({ context }, applyFixture) => {
    const setModeFunc = async (mode: SiteMode) => {
      // Set for both localhost and 127.0.0.1 to be safe
      await context.addCookies([
        {
          name: 'mode',
          value: mode,
          url: 'http://localhost:3000',
          expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
        },
      ]);
    };
    await applyFixture(setModeFunc);
  },

  // Persistent site mode fixture
  siteMode: async ({ page }, applyFixture) => {
    const html = page.locator('html');
    const className = await html.getAttribute('class');
    if (className?.includes('light')) {
      await applyFixture('wedding');
    } else {
      await applyFixture('production');
    }
  },
});

export { expect };
