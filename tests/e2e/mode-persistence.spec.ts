import type { Page } from '@playwright/test';
import { expect, test } from '../support/fixtures';

test.describe('Mode Persistence & Switcher', () => {
  // Robust Mobile Interaction Helper: Target-First Approach
  const ensureMenuOpenAndClick = async (page: Page, text: 'Wedding' | 'Production') => {
    const viewportSize = page.viewportSize();
    const isMobile = viewportSize && viewportSize.width < 768;

    if (isMobile) {
       // 1. Try to find the target button explicitly and check visibility
       // We use getByRole to ensure we interact with the button
       const menuBtn = page.getByRole('button', { name: text, exact: true });
       
       if (await menuBtn.isVisible()) {
           await menuBtn.click();
       } else {
           // 2. If not visible, assume menu is closed. Open it.
           // Note: If menu IS open but button somehow not visible, this might toggle it closed.
           // But normally if Open, button IS visible.
           await page.getByTestId('mobile-menu-button').click();
           
           // 3. Wait for it to appear
           await expect(menuBtn).toBeVisible({ timeout: 5000 });
           await menuBtn.click();
       }
    } else {
       // Desktop
       await page.getByRole('button', { name: text, exact: true }).filter({ visible: true }).click();
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

    // Switch back
    await ensureMenuOpenAndClick(page, 'Production');
    
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'production');
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
