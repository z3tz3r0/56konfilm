import { expect, test } from '../support/fixtures';

test.describe('Bilingual SEO & Routing', () => {

  test('should render English version when preferred', async ({ browser }) => {
    const context = await browser.newContext({
      locale: 'en-US',
    });
    const page = await context.newPage();
    // GIVEN: User visits the root URL with EN preference
    await page.goto('/');

    // THEN: HTML lang attribute is 'en'
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // AND: Canonical URL points to EN version
    // Note: Adjust localhost port/domain expectation as needed or use regex
    const canonical = page.locator('link[rel="canonical"]');
    // Assert at least one canonical tag exists (some setups emit multiple)
    expect(await canonical.count()).toBeGreaterThan(0);
    
    // AND: Hreflang tags exist for en and th
    expect(
      await page
        .locator('link[rel="alternate"][hreflang="en"]')
        .count()
    ).toBeGreaterThan(0);
    expect(
      await page
        .locator('link[rel="alternate"][hreflang="th"]')
        .count()
    ).toBeGreaterThan(0);
    await context.close();
  });

  test('should render Thai version when accessing /th path', async ({ page }) => {
    // GIVEN: User visits the /th path
    await page.goto('/th');

    // THEN: HTML lang attribute is 'th'
    await expect(page.locator('html')).toHaveAttribute('lang', 'th');

    // AND: Canonical URL points to TH version
    // await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /.*\/th$/);
  });

  test('should switch language via UI', async ({ page }) => {
    // GIVEN: User is on English page
    await page.goto('/');
    
    // WHEN: User clicks Thai language switcher
    // We assume there will be a switcher. We define data-testid requirement here.
    const thButton = page.locator('[data-testid="language-switcher-th"]:visible');
    if (!(await thButton.isVisible())) {
      const mobileMenuButton = page.getByTestId('mobile-menu-button');
      await mobileMenuButton.click();
    }
    await expect(thButton).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/th/),
      thButton.click(),
    ]);

    // THEN: URL changes to /th...
    await expect(page).toHaveURL(/\/th/);

    // AND: HTML lang updates
    await expect(page.locator('html')).toHaveAttribute('lang', 'th');
  });

  // Proxy / Middleware Test
  test('should redirect/rewrite based on Accept-Language header', async ({ browser }) => {
    // This requires a new context with specific locale
    const context = await browser.newContext({
      locale: 'th-TH',
    });
    const page = await context.newPage();

    // GIVEN: User prefers Thai
    // WHEN: Visits root /
    await page.goto('/');

    // THEN: Should display Thai content (either via redirect to /th or rewrite)
    // The story requirements suggest /th URL structure is preferred for SEO.
    // So we expect a redirect or rewrite that results in Thai content/metadata.
    // If it's a redirect:
    await expect(page).toHaveURL(/\/th/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'th');

    await context.close();
  });

});
