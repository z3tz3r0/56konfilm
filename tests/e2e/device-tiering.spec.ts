import { expect, test } from '@playwright/test';

const HYBRID_PROJECT_PATH = '/en/work/e2e-hybrid-gallery';

test.describe('Device Tiering', () => {
  test('low-power profile disables gallery video autoplay and renders fallback', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(HYBRID_PROJECT_PATH);

    const galleryVideo = page.getByTestId('gallery-item-video').first();
    await expect(galleryVideo).toBeVisible();

    await expect(galleryVideo.getByTestId('video-item-fallback')).toBeVisible();
    await expect(galleryVideo.getByTestId('video-item')).toHaveCount(0);
  });

  test('high-end profile keeps gallery video element with autoplay enabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(HYBRID_PROJECT_PATH);

    const galleryVideo = page.getByTestId('gallery-item-video').first();
    await expect(galleryVideo).toBeVisible();

    const video = galleryVideo.getByTestId('video-item');
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute('autoplay', '');
  });

  test('low-power profile removes heavy hover transform classes on media items', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(HYBRID_PROJECT_PATH);

    const galleryImage = page.getByTestId('gallery-item-image').first();
    await expect(galleryImage).toBeVisible();

    const image = galleryImage.locator('img').first();
    await expect(image).toHaveAttribute('class', /transition-none/);
  });

  test('high-end profile retains heavy hover transform classes on media items', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(HYBRID_PROJECT_PATH);

    const galleryImage = page.getByTestId('gallery-item-image').first();
    await expect(galleryImage).toBeVisible();

    const image = galleryImage.locator('img').first();
    await expect(image).toHaveAttribute('class', /transition-transform/);
  });
});
