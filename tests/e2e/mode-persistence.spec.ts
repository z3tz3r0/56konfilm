import type { Page } from '@playwright/test';
import { expect, test } from '../support/fixtures';

test.describe('Mode Persistence & Switcher', () => {
  // Robust Mobile Interaction Helper: Target-First Approach
  const ensureMenuOpenAndClick = async (page: Page, text: 'Wedding' | 'Production') => {
    const viewportSize = page.viewportSize();
    const isMobile = viewportSize && viewportSize.width < 768;

    if (isMobile) {
      const menuBtn = page.locator(`button:visible`, { hasText: text });

      if (!(await menuBtn.isVisible())) {
        await page.getByTestId('mobile-menu-button').click();
      }

      await expect(menuBtn).toBeVisible({ timeout: 5000 });
      await expect(menuBtn).toBeEnabled();
      await menuBtn.click();
    } else {
       // Desktop
       const menuBtn = page.locator('button:visible', { hasText: text });
       await expect(menuBtn).toBeEnabled();
       await menuBtn.click();
    }
  };

  test('should default to production (dark) mode on first visit', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'production');
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should persist wedding mode after refresh', async ({ page }) => {
    await page.goto('/');
    
    await ensureMenuOpenAndClick(page, 'Wedding');
    
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'wedding');
    await expect(page.locator('html')).toHaveClass(/light/);

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-mode', 'wedding');
    await expect(page.locator('html')).toHaveClass(/light/); 
  });
  
  test('should switch back to production', async ({ page }) => {
    await page.goto('/');
    
    await ensureMenuOpenAndClick(page, 'Wedding');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'wedding');
    
    // Add small pause to ensure any navigation/animation settles
    await page.waitForTimeout(500);
    const curtain = page.locator('[data-testid="curtain-wipe"]');
    if (await curtain.isVisible()) {
      await curtain.waitFor({ state: 'hidden', timeout: 15000 });
    }

    // Switch back
    await ensureMenuOpenAndClick(page, 'Production');
    
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'production');
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
