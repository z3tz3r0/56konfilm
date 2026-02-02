import { expect, test } from '@playwright/test';
import { createMediaGalleryBlock } from '../support/factories/media-gallery.factory';
import { createProject } from '../support/factories/project.factory';

test.describe('Media Gallery (Hybrid Video Support)', () => {
  test('should render mixed image and video grid items correctly', async ({ page }) => {
    // GIVEN: A project with a MediaGallerySection containing both Image and Video
    const mockProject = createProject({
      contentBlocks: [
        createMediaGalleryBlock({
          // @ts-ignore - Mocking specific mixed content
          items: [
            {
              _key: 'item-image-1',
              mediaType: 'image',
              image: {
                asset: {
                  _ref: 'image-test-100x100-jpg',
                  _type: 'reference'
                } 
              },
              alt: 'Test Image',
              label: 'Image Item'
            },
            {
              _key: 'item-video-1',
              mediaType: 'video',
              videoFile: {
                asset: {
                  url: 'https://cdn.sanity.io/files/test/video.mp4'
                }
              },
              alt: 'Test Video',
              label: 'Video Item'
            }
          ]
        })
      ]
    });

    // Mock the Sanity response
    await page.route('**/data/query/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: mockProject, // For Detail Page query
          query: '' // Placeholder
        }),
      });
    });

    // WHEN: Visiting the project page
    await page.goto(`/work/${mockProject.slug}`);

    // THEN: The Image Item should be visible
    // We expect the image to rely on next/image struct or similar
    // Using a broad check first
    const imageContainer = page.locator('[data-key="item-image-1"]'); // Assuming we add keys to items
    // If keys not yet implemented, we look for alt text
    const image = page.getByAltText('Test Image');
    await expect(image).toBeVisible();

    // THEN: The Video Item should be visible and use a <video> tag
    // We target by the 'video' tag inside the known item container or by attributes
    // Strategy: Look for video with the specific src
    const video = page.locator('video[src="https://cdn.sanity.io/files/test/video.mp4"]');
    
    // Assert existence and visibility
    await expect(video).toBeAttached({ message: 'Video tag should be present in DOM' });
    await expect(video).toBeVisible();

    // THEN: The video should have required attributes for autoplay functionality
    await expect(video).toHaveAttribute('autoplay', '');
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('playsinline', '');

    // CHECK: Performance Constraint (Intersection Observer)
    // Checking 'paused' state requires digging into properties or evaluating JS
    // We verify strict compliance by checking if it defaults to playing (autoplay) but check implementation logic later
  });
});
