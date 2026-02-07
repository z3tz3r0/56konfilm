import { expect, test } from '../support/fixtures/device-tier.fixture';

test.describe('Performance & Motion Tuning (Device Tiering)', () => {
  test('GIVEN low-power conditions WHEN page loads THEN app marks low tier', async ({
    page,
    lowTierProfile,
    mockDeviceProfile,
  }) => {
    await mockDeviceProfile(lowTierProfile);

    await page.goto('/en/work/atdd-magazine-test');

    await expect(page.locator('html')).toHaveAttribute('data-device-tier', 'low');
  });

  test('GIVEN high-end conditions WHEN page loads THEN app marks high tier', async ({
    page,
    highTierProfile,
    mockDeviceProfile,
  }) => {
    await mockDeviceProfile(highTierProfile);

    await page.goto('/en/work/atdd-magazine-test');

    await expect(page.locator('html')).toHaveAttribute('data-device-tier', 'high');
  });

  test('GIVEN low-power conditions WHEN project media renders THEN video autoplay is disabled', async ({
    page,
    lowTierProfile,
    mockDeviceProfile,
  }) => {
    await mockDeviceProfile(lowTierProfile);

    await page.goto('/en/work/atdd-magazine-test');

    const video = page.getByTestId('gallery-item-video').locator('video').first();
    await expect(video).not.toHaveAttribute('autoplay', '');
  });
});
