import { expect, test } from '../support/fixtures';

test.describe('Wedding Mode Skinning', () => {
  
  test.beforeEach(async () => {
    // page.on('console', msg => {
    //   const type = msg.type();
    //   const text = msg.text();
    //   if (type === 'error' || text.includes('[Mode]') || text.includes('[RootLayout]') || text.includes('[useMode]') || text.includes('[ModeSwitcher]')) {
    //     console.log(`[Browser] ${type.toUpperCase()}: ${text}`);
    //   }
    // });
  });

  test('should apply Wedding theme variables when mode is active', async ({ page, setMode }) => {
    // GIVEN: User is in Wedding Mode
    await setMode('wedding');
    await page.goto('/');

    // WHEN: The page renders
    const body = page.locator('body');

    // THEN: The background color should match Ivory White (--color-ivory-white: #faf7f2)
    // We check computed style to ensure CSS variables are correctly applied via globals.css
    await expect(body).toHaveCSS('background-color', 'rgb(250, 247, 242)'); // #faf7f2

    // AND: The text color should match Brown (--color-brown: #5b4339)
    await expect(body).toHaveCSS('color', 'rgb(91, 67, 57)'); // #5b4339
  });

  test('should switch typography to Cormorant Garamond in Wedding Mode', async ({ page, setMode }) => {
    // GIVEN: User is in Wedding Mode
    await setMode('wedding');
    await page.goto('/');

    // WHEN: We check a heading (h1)
    const h1 = page.locator('h1').first();

    // THEN: Font family should include "Cormorant Garamond"
    await expect(h1).toHaveCSS('font-family', /Cormorant Garamond/);
  });

  test('should persist wedding skin across navigation', async ({ page, setMode }) => {
    // GIVEN: User is in Wedding Mode on Home
    await setMode('wedding');
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'wedding');

    // WHEN: User navigates to another page (e.g., Contact)
    // We navigate directly to test persistence logic, bypassing UI interaction flakiness
    await page.goto('/en/contact'); 

    // THEN: The mode should still be Wedding
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'wedding');
    
    // AND: Skinning variables should still apply
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(250, 247, 242)');
  });

  test('should revert to Production skin when toggled back', async ({ page, setMode }) => {
    // GIVEN: User starts in Wedding Mode
    await setMode('wedding');
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'wedding');

    // WHEN: User switches back to Production
    const productionButton = page
      .getByTestId('mode-switcher')
      .filter({ visible: true })
      .getByRole('button', { name: 'Production' });

    // Target-First Strategy:
    if (!(await productionButton.isVisible())) {
      // If button isn't visible on mobile, open the menu
      await page.getByTestId('mobile-menu-button').click();
    }

    // Ensure button is ready
    await expect(productionButton).toBeVisible();
    await productionButton.click();

    // Verify transition starts (curtain appears)
    const curtain = page.getByTestId('curtain');
    await expect(curtain).toBeVisible();

    // Verify transition ends (curtain disappears)
    await expect(curtain).toBeHidden({ timeout: 10000 }); // Give time for animation + nav

    // THEN: The mode should be Production
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'production');

    // AND: Background should be Midnight Black (#00040d: rgb(0, 4, 13))
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 4, 13)');
    
    // AND: Font should be Sora
    const h1 = page.locator('h1').first();
    await expect(h1).toHaveCSS('font-family', /Sora/);
  });
});
