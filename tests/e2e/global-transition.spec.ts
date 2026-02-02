import { expect, test } from '../support/fixtures';

test.describe('Global Visual Transitions', () => {
  test('should display curtain wipe animation when switching modes', async ({ page, setMode }) => {
    // Start in production mode
    await setMode('production');
    await page.goto('/');

    // Verify initial state
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Initial check for mobile menu
    const mobileMenuBtn = page.getByTestId('mobile-menu-button');
    const isMobile = await mobileMenuBtn.isVisible();
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
      // Wait for menu to open ?? context dependent
      // Assuming menu content appears.
    }

    // Click to switch to wedding mode
    const weddingButton = page.getByRole('button', { name: /Wedding/i }).filter({ visible: true });
    await weddingButton.click();

    // Expect curtain wipe to appear immediately
    const curtain = page.getByTestId('curtain-wipe');
    await expect(curtain).toBeVisible({ timeout: 10000 });

    // Validate curtain color (Wedding mode -> expecting light/ivory)
    await expect(curtain).toHaveCSS('background-color', 'rgb(250, 247, 242)'); // #faf7f2

    // If mobile menu is present, curtain must cover the viewport (and therefore the menu)
    if (isMobile) {
      const viewport = page.viewportSize();
      expect(viewport).toBeTruthy();
      if (viewport) {
        const box = await curtain.boundingBox();
        expect(box).toBeTruthy();
        if (box) {
          expect(box.x).toBeLessThanOrEqual(1);
          expect(box.y).toBeLessThanOrEqual(1);
          await expect
            .poll(async () => (await curtain.boundingBox())?.width ?? 0)
            .toBeGreaterThanOrEqual(viewport.width - 1);
          await expect
            .poll(async () => (await curtain.boundingBox())?.height ?? 0)
            .toBeGreaterThanOrEqual(viewport.height - 1);
        }
      }
    }

    // Eventually, mode should change
    await expect(page.locator('html')).toHaveClass(/light/);
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'wedding');

    // Curtain should disappear after transition
    await expect(curtain).toBeHidden({ timeout: 15000 });
  });

  test('should not show FOUC during transition', async ({ page, setMode }) => {
     // Start in wedding mode
     await setMode('wedding');
     await page.goto('/');
 
    // Initial check for mobile menu
    const mobileMenuBtn = page.getByTestId('mobile-menu-button');
    const isMobile = await mobileMenuBtn.isVisible();
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
    }

     // Click to switch to production mode
     const productionButton = page.getByRole('button', { name: /Production/i }).filter({ visible: true });
     await productionButton.click();
 
     // Curtain should appear
     const curtain = page.getByTestId('curtain-wipe');
     await expect(curtain).toBeVisible({ timeout: 10000 });

     // Validate curtain color (Production mode -> expecting black/midnight)
     await expect(curtain).toHaveCSS('background-color', 'rgb(0, 4, 13)'); // #00040d

     // If mobile menu is present, curtain must cover the viewport (and therefore the menu)
     if (isMobile) {
       const viewport = page.viewportSize();
       expect(viewport).toBeTruthy();
       if (viewport) {
         const box = await curtain.boundingBox();
         expect(box).toBeTruthy();
         if (box) {
           expect(box.x).toBeLessThanOrEqual(1);
           expect(box.y).toBeLessThanOrEqual(1);
           await expect
             .poll(async () => (await curtain.boundingBox())?.width ?? 0)
             .toBeGreaterThanOrEqual(viewport.width - 1);
           await expect
             .poll(async () => (await curtain.boundingBox())?.height ?? 0)
             .toBeGreaterThanOrEqual(viewport.height - 1);
         }
       }
     }

     // While curtain is visible, the body background should eventually update
     await expect(page.locator('html')).toHaveAttribute('data-mode', 'production');
  });
});
