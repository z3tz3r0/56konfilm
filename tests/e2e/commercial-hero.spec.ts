import { expect, test } from '../support/fixtures';

test.describe('Commercial Homepage - Brutal Loop', () => {
  const TEST_HERO_URL = '/test-hero';

  test('should play muted video loop in Commercial Mode', async ({ page, setMode }) => {
    await setMode('production');
    await page.goto(TEST_HERO_URL);

    const poster = page.getByAltText('Section background').or(page.getByAltText('Video poster'));
    // We expect poster to be present (blur-up)
    await expect(poster).toBeAttached();

    const video = page.locator('video').first(); 
    await expect(video).toBeVisible({ timeout: 10000 });
    await expect(video).toHaveAttribute('autoPlay', '');
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).not.toHaveAttribute('controls');
    
    // Check if it's playing
    await expect(async () => {
         const paused = await video.evaluate((vid) => (vid as HTMLVideoElement).paused);
         expect(paused).toBe(false);
    }).toPass({ timeout: 5000 });
  });

  test('should display "WE SHOOT HARD" text overlaid', async ({ page, setMode }) => {
    await setMode('production');
    await page.goto(TEST_HERO_URL);
    
    // Check Parallax Text
    const heroText = page.getByText('WE SHOOT HARD');
    await expect(heroText).toBeVisible();
    
    // Check styled as Brutal (uppercase, approx font size check via class)
    await expect(heroText).toHaveClass(/uppercase/);
    await expect(heroText).toHaveClass(/font-black/);
  });

  test('should react to scroll with velocity-based skew', async ({ page, setMode }) => {
    await setMode('production');
    await page.goto(TEST_HERO_URL);

    const heroText = page.getByText('WE SHOOT HARD');
    await expect(heroText).toBeVisible();

    // Get initial transform
    const initialTransform = await heroText.evaluate((el) => 
      window.getComputedStyle(el).transform
    );

    // Scroll rapidly to trigger velocity skew
    await page.evaluate(() => {
      window.scrollBy({ top: 500, behavior: 'auto' });
    });

    // Wait for animation frame
    await page.waitForTimeout(100);

    // Transform should have changed due to velocity
    const transformedStyle = await heroText.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Transform should be different (velocity creates skew)
    expect(transformedStyle).not.toBe(initialTransform);
  });
});
