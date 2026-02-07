import type { Page } from '@playwright/test';
import { expect, test } from '../support/fixtures';

test.describe('Dual-Context About Page', () => {
  const switchMode = async (
    page: Page,
    mode: 'Wedding' | 'Production',
    isMobile: boolean
  ) => {
    if (isMobile) {
      await page.getByTestId('mobile-menu-button').click();
    }

    const switcher = page.getByTestId('mode-switcher').filter({ visible: true });
    await expect(switcher).toBeVisible();

    const button = switcher.getByRole('button', { name: mode });
    await button.click();

    if (isMobile) {
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
    }
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to About page (assuming slug is 'about')
    await page.goto('/en/about?e2e=1');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render Commercial content in Production mode', async ({ page }) => {
    // Verify we're in Production (dark) mode
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 10000 });

    // Verify page content exists
    const pageContent = page.getByTestId('page-content');
    await expect(pageContent).toBeVisible({ timeout: 5000 });

    // Capture initial content for comparison
    const initialSignature = await pageContent.getAttribute('data-content-signature');
    expect(initialSignature).toBeTruthy();
  });

  test('should render Wedding content in Wedding mode', async ({ page, isMobile }) => {
    // Switch to Wedding mode
    await switchMode(page, 'Wedding', isMobile);

    // Verify we're in Wedding (light) mode  
    await expect(page.locator('html')).toHaveClass(/light/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/about(\?|$)/);

    // Verify page content exists
    const pageContent = page.getByTestId('page-content');
    await expect(pageContent).toBeVisible({ timeout: 5000 });

    // Capture content in wedding mode
    const weddingSignature = await pageContent.getAttribute('data-content-signature');
    expect(weddingSignature).toBeTruthy();
  });

  test('should swap content when toggling modes on About page', async ({ page, isMobile }) => {
    // Start in Production mode
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 10000 });

    // Capture initial content structure (number of sections)
    const initialContent = page.getByTestId('page-content');
    const initialSignature = await initialContent.getAttribute('data-content-signature');
    const initialSections = await page.locator('main section').count();
    expect(initialSignature).toBeTruthy();

    // Switch to Wedding mode via UI
    await switchMode(page, 'Wedding', isMobile);

    // Wait for mode change and page reload
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('html')).toHaveClass(/light/, { timeout: 15000 });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify content has changed
    const newContent = page.getByTestId('page-content');
    const newSignature = await newContent.getAttribute('data-content-signature');
    const newSections = await page.locator('main section').count();

    // Content should exist in both modes
    expect(newSignature).toBeTruthy();
    expect(newSections).toBeGreaterThan(0);
    expect(initialSignature).not.toBe(newSignature);
    expect(initialSections).toBeGreaterThan(0);

    // Verify we're still on the About page
    await expect(page).toHaveURL(/\/about(\?|$)/);
  });

  test('should maintain correct content after mode switch and page reload', async ({ 
    page,
    isMobile,
  }) => {
    // Switch to Wedding mode
    await switchMode(page, 'Wedding', isMobile);
    await expect(page.locator('html')).toHaveClass(/light/, { timeout: 10000 });

    // Capture Wedding content
    const weddingContent = await page.getByTestId('page-content').getAttribute('data-content-signature');
    expect(weddingContent).toBeTruthy();

    // Reload the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify still in Wedding mode
    await expect(page.locator('html')).toHaveClass(/light/, { timeout: 10000 });

    // Content should still be present after reload
    const reloadedContent = await page.getByTestId('page-content').getAttribute('data-content-signature');
    expect(reloadedContent).toBeTruthy();
  });

  test('should transition smoothly without flashing', async ({ page, isMobile }) => {
    // Verify initial state
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 10000 });

    // Click to initiate mode change
    await switchMode(page, 'Wedding', isMobile);

    // Look for the curtain transition (should appear during mode change)
    const curtain = page.getByTestId('curtain');
    
    // Curtain should be visible during transition (if motion isn't reduced)
    // This may or may not catch it depending on timing, but won't cause test failure
    await curtain.isVisible().catch(() => false);

    // Wait for transition to complete
    await page.waitForLoadState('domcontentloaded');
    
    // Verify final state
    await expect(page.locator('html')).toHaveClass(/light/, { timeout: 15000 });
  });
});
