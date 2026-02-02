import { expect, test } from '../support/fixtures';

test.describe('Project Magazine Layout', () => {
  // We assume a seed project "atdd-magazine-test" exists or we mock the data
  // Since we can't easily mock RSC, we define expectations for the UI structure.
  // The dev will need to either seed this data or implement the logic to render it.
  
  const TEST_SLUG = 'atdd-magazine-test';

  test('should render magazine blocks and new metadata', async ({ page, setMode }) => {
    // GIVEN: Visitor is in Production mode
    await setMode('production');
    
    // WHEN: Visiting a project page
    await page.goto(`/en/works/${TEST_SLUG}`);

    // THEN: New Metadata Fields should be visible
    // These require the 'client', 'year', 'services' fields from the story AC
    await expect(page.getByTestId('project-client'), 'Client name should be visible').toBeVisible();
    await expect(page.getByTestId('project-year'), 'Project year should be visible').toBeVisible();
    await expect(page.getByTestId('project-services'), 'Services list should be visible').toBeVisible();

    // THEN: Magazine Layout Blocks should be rendered
    // We expect the page builder to render these specific sections
    
    // 1. Hero Section (Parallax/Video)
    await expect(page.locator('section[data-sanity-type="heroSection"]'), 'Hero Section block should be rendered').toBeVisible();
    
    // 2. Two Column Section (Text/Image)
    await expect(page.locator('section[data-sanity-type="twoColumnSection"]'), 'Two Column Section block should be rendered').toBeVisible();
    
    // 3. Media Gallery Section (Grid)
    await expect(page.locator('section[data-sanity-type="mediaGallerySection"]'), 'Media Gallery Section block should be rendered').toBeVisible();
  });
});
