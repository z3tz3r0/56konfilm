import { expect, test } from '../support/fixtures';

test.describe('Smart Contact Form Routing', () => {
  const ensureMenuOpenAndClick = async (page, text: 'Wedding' | 'Production') => {
    const mobileMenuBtn = page.getByTestId('mobile-menu-button');
    if (await mobileMenuBtn.isVisible()) {
      const targetButton = page.getByRole('button', { name: text }).filter({ visible: true });
      if (!(await targetButton.isVisible())) {
        await mobileMenuBtn.click();
      }
    }
    const targetButton = page.getByRole('button', { name: text }).filter({ visible: true });
    await targetButton.click();
    if (await mobileMenuBtn.isVisible()) {
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
    }
  };

  // Test Data
  const commercialData = {
    name: 'Agency X',
    email: 'contact@agencyx.com',
    message: 'We want to produce a TVC.',
  };

  const weddingData = {
    name: 'Couple Y',
    email: 'love@couple.com',
    message: 'We are getting married!',
    weddingDate: new Date(),
    venue: 'Grand Hotel',
  };

  test('should display Commercial Inquiry by default (Production Mode)', async ({ page, setMode }) => {
    await setMode('production');
    await page.goto('/en/contact');

    // Header check
    await expect(page.getByRole('heading', { name: /Commercial Inquiry/i })).toBeVisible();

    // Fields check: Wedding specific fields should NOT be visible
    await expect(page.getByLabel(/^Wedding Date/i)).not.toBeVisible();
    await expect(page.getByLabel(/^Venue/i)).not.toBeVisible();

    // Fill form
    await page.getByLabel(/^Name/i).fill(commercialData.name);
    await page.getByLabel(/^Email/i).fill(commercialData.email);
    await page.getByLabel(/^Message/i).fill(commercialData.message);

    // Submit
    await page.getByRole('button', { name: /Send Message/i }).click();

    // Validate Toast Success
    await expect(page.locator('li[data-sonner-toast]')).toContainText('Commercial Inquiry received', { timeout: 10000 });
  });

  test('should display Wedding form in Wedding Mode', async ({ page, setMode }) => {
    await setMode('wedding');
    await page.goto('/en/contact');

    // Header check
    await expect(page.getByRole('heading', { name: /Tell us your love story/i })).toBeVisible();

    // Fields check: Wedding specific fields SHOULD be visible
    await expect(page.getByLabel(/^Wedding Date/i)).toBeVisible();
    await expect(page.getByLabel(/^Venue/i)).toBeVisible();

    // Fill form
    await page.getByLabel(/^Name/i).fill(weddingData.name);
    await page.getByLabel(/^Email/i).fill(weddingData.email);
    await page.getByLabel(/^Venue/i).fill(weddingData.venue);
    await page.getByLabel(/^Message/i).fill(weddingData.message);
    
    // Pick date
    await page.getByRole('button', { name: /Wedding Date/i }).click();
    // Click first enabled day in the current month
    const firstEnabledDay = page.locator('button.rdp-day:not([disabled])').first();
    await firstEnabledDay.waitFor({ state: 'visible' });
    await firstEnabledDay.click();
    
    // Ensure the popover closed
    await page.keyboard.press('Escape'); 
    await page.waitForTimeout(500);

    // Submit
    const submitBtn = page.getByRole('button', { name: /Send Message/i });
    await submitBtn.click();

    // Validate Toast Success
    await expect(page.locator('li[data-sonner-toast]')).toContainText('Love story received', { timeout: 15000 });
  });

  test('should transition fields when switching mode on the page', async ({ page, setMode }) => {
     // Start in Commercial
     await setMode('production');
     await page.goto('/en/contact');
 
     // Verify Initial State
     await expect(page.getByRole('heading', { name: /Commercial Inquiry/i })).toBeVisible();
     await expect(page.getByLabel(/^Venue/i)).not.toBeVisible();
 
     // Switch to Wedding via UI (Navbar)
     // The Navbar contains the ModeSwitcher
     await ensureMenuOpenAndClick(page, 'Wedding');

     // Verify Transition on page
     await expect(page.getByRole('heading', { name: /Tell us your love story/i })).toBeVisible();
     
     // Verify Animation/Presence of new field
     await expect(page.getByLabel(/^Venue/i)).toBeVisible();
  });
});
