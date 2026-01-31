import { expect, test } from '../support/fixtures';

test.describe('Global Mode Switcher', () => {
  test.beforeEach(async ({ page }) => {
    // Start at home
    await page.goto('/');
  });

  test('should default to Production (Commercial) mode', async ({ page }) => {
    // next-themes may take a moment to hydrate and apply the class
    // toHaveClass has built-in auto-retry which is much more stable
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 10000 });
  });

  test('should switch to Wedding mode and persist', async ({ page, setMode }) => {
    // 1. Switch to wedding
    await setMode('wedding');

    // 2. Verify html has 'light' theme (auto-retry)
    await expect(page.locator('html')).toHaveClass(/light/, { timeout: 10000 });

    // 3. Verify persistence after reload
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/light/, { timeout: 10000 });
  });

  test('should toggle mode via UI interaction', async ({ page, isMobile }) => {
    // 1. If mobile, open the menu first
    if (isMobile) {
      await page.getByTestId('mobile-menu-button').click();
    }

    // 2. Find Mode Switcher and specifically click the "Wedding" button
    // Using hasText to target the specific button within the switcher
    const switcher = page.getByTestId('mode-switcher').filter({ visible: true });
    await expect(switcher).toBeVisible();

    const weddingBtn = switcher.getByRole('button', { name: 'Wedding' });
    await expect(weddingBtn).toBeEnabled();
    
    // 3. Click to switch
    await weddingBtn.click();
    
    // Wait for navigation and state settling (transition duration + network)
    await page.waitForLoadState('domcontentloaded');

    // 4. Verify theme changed on html
    await expect(page.locator('html')).toHaveClass(/light/, { timeout: 15000 });

    // 5. Verify cookie updated with retry
    await expect(async () => {
      const cookies = await page.context().cookies();
      const modeCookie = cookies.find((c) => c.name === 'mode');
      expect(modeCookie?.value).toBe('wedding');
    }).toPass({ timeout: 10000 });
  });
});
