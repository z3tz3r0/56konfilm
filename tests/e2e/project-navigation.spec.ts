import { expect, test } from '../support/fixtures';

test.describe('Project Navigation', () => {
  test('should navigate to next project with cinematic transition', async ({ page, setMode }) => {
    await setMode('production');
    // 1. Visit a project page
    await page.goto('/en/work/e2e-hybrid-gallery');

    // 2. Scroll to bottom manually to ensure loading/visibility
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const nextProjectTitle = page.getByTestId('next-project-title');

    // 3. Assert Navigation Card is visible
    await expect(nextProjectTitle).toBeVisible();
    await expect(page.getByTestId('next-project-label')).toHaveText('Next Project');
    
    // 4. Click Next Project (Trigger Transition)
    await nextProjectTitle.click();

    // 5. Assert Curtain Wipe (Cinematic Transition)
    const curtain = page.getByTestId('curtain');
    await expect(curtain).toBeVisible({ timeout: 10000 });

    // 6. Assert Navigation occurred
    await expect(page).toHaveURL(/\/en\/work\/e2e-project-magazine-layout$/);

    // 7. Curtain should lift after navigation
    await expect(curtain).toBeHidden({ timeout: 15000 });

    // 8. Mode should persist (no mode switch)
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'production');
  });

  test('should keep wedding mode when navigating to next project', async ({ page, setMode }) => {
    await setMode('wedding');
    await page.goto('/en/work/e2e-hybrid-gallery');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByTestId('next-project-title')).toBeVisible();

    await page.getByTestId('next-project-title').click();

    const curtain = page.getByTestId('curtain');
    await expect(curtain).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/en\/work\/e2e-project-magazine-layout$/);
    await expect(curtain).toBeHidden({ timeout: 15000 });
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'wedding');
  });
});
