import { expect, test } from '../support/fixtures';

test.describe('SEO & Metadata Perfection', () => {
  test('should render dynamic metadata on Home page', async ({ page }) => {
    // GIVEN: User is on the Home page
    await page.goto('/en');

    // THEN: Title is correct (should fail if not implemented/using fallback)
    await expect(page).toHaveTitle(/.*| 56KonFilm/);

    // AND: Meta description exists
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.+/);

    // AND: OpenGraph tags are present
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /.+/);
  });

  test('should render project-specific metadata and JSON-LD', async ({ page }) => {
    // GIVEN: User is on a Project Detail page
    // Note: 'atdd-magazine-test' is a known mock slug from page.tsx (work/[slug])
    await page.goto('/en/work/atdd-magazine-test');

    // THEN: Title matches project title
    await expect(page).toHaveTitle(/E2E Magazine Project | .*/);

    // AND: JSON-LD VideoObject is present
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
    
    // RED Phase: This will fail until JsonLd component is added
    const content = await jsonLd.textContent();
    expect(content).toContain('"@type":"VideoObject"');
  });

  test('should update canonical and hreflang on language switch', async ({ page }) => {
    // GIVEN: User is on English Project page
    await page.goto('/en/work/atdd-magazine-test');
    
    // THEN: Canonical points to EN
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /.*\/en\/work\/atdd-magazine-test/);

    // WHEN: Switch to Thai
    const thButton = page.locator('[data-testid="language-switcher-th"]:visible').first();
    if (await thButton.isVisible()) {
      await thButton.click();
    } else {
      const mobileMenuButton = page.getByTestId('mobile-menu-button');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await page.locator('[data-testid="language-switcher-th"]:visible').first().click();
      } else {
        await page.goto('/th/work/atdd-magazine-test');
      }
    }
    await page.waitForURL(/\/th\/work/);

    // THEN: Canonical updates to TH
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /.*\/th\/work\/atdd-magazine-test/);

    // AND: Hreflang alternates are correct
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /.*\/en\/work\/atdd-magazine-test/);
    await expect(page.locator('link[rel="alternate"][hreflang="th"]')).toHaveAttribute('href', /.*\/th\/work\/atdd-magazine-test/);
  });
});
