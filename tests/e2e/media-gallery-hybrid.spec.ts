import { expect, test } from '@playwright/test';

test.describe('Media Gallery (Hybrid Video Support)', () => {
  test('should render mixed image and video grid items correctly', async ({ page }) => {
    // GIVEN: The server is configured to return a mock project for slug 'e2e-hybrid-gallery'
    // (See src/app/[lang]/work/[slug]/page.tsx getE2eMockProject)

    // WHEN: Visiting the project page
    await page.goto('/work/e2e-hybrid-gallery');

    // THEN: The Image Item should be visible
    const image = page.getByTestId('gallery-item-image');
    await expect(image).toBeVisible();

    // THEN: The Video Item should be visible and use a <video> tag
    const videoFigure = page.getByTestId('gallery-item-video');
    await expect(videoFigure).toBeVisible();
    
    // Check specific video tag properties
    const video = videoFigure.locator('video');
    await expect(video).toBeAttached();
    await expect(video).toBeVisible();

    // Verify correct source
    await expect(video).toHaveAttribute('src', 'https://cdn.sanity.io/files/test/video.mp4');

    // THEN: The video should have required attributes for autoplay functionality
    await expect(video).toHaveAttribute('autoplay', '');
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('playsinline', '');

    // Note: IntersectionObserver logic is hard to test in non-visual headless mode without scrolling
    // but the presence of the video tag and attributes confirms the core requirement.
  });
});
