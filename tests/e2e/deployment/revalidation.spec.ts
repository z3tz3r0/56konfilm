import { expect, test } from '../../support/fixtures';

test.describe('Deployment & Performance Polish', () => {
  test('should have priority LCP image on the homepage', async ({ page }) => {
    // GIVEN: The user navigates to the homepage
    await page.goto('/en');

    // WHEN: The page loads
    // THEN: The hero image (LCP) should have the 'fetchpriority="high"' or 'priority' marker
    // Note: Next.js 'priority' prop renders as fetchpriority="high" and removes lazy loading
    const heroImage = page.locator('header img, section:first-of-type img').first();
    
    // This is a performance check for AC2
    await expect(heroImage).toHaveAttribute('fetchpriority', 'high');
    await expect(heroImage).not.toHaveAttribute('loading', 'lazy');
  });

  test('should return 401 for unauthorized revalidation requests', async ({ request }) => {
    // This is the E2E verification of the API task (AC1)
    const response = await request.post('/api/revalidate', {
      data: { _type: 'page' }
    });
    expect(response.status()).toBe(401);
  });
});
