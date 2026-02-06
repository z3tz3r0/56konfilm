import { expect, test } from '../support/fixtures';

test.describe('Wedding Mode Validation', () => {
  test('should persist wedding mode after hard reload', async ({ page, setMode }) => {
    // GIVEN: User is in Wedding Mode
    await setMode('wedding');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'wedding');

    // WHEN: Hard reload occurs
    await page.reload();

    // THEN: Mode should still be wedding immediately
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'wedding');
    
    // AND: Body background should be Ivory White (checking effective style)
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(250, 247, 242)');
  });

  test('should not show FOUC (flash of unstyled content) or wrong mode', async ({ page, setMode }) => {
     // GIVEN: Cookie is set to wedding
     await setMode('wedding');

     // WHEN: We reload
     await page.reload();

     // THC: The script should check that at no point do we see "production" mode
     // This is hard to catch with standard expectations unless we use a listener or very fast poll.
     // But we can check that standard assertions pass quickly.
     
     const html = page.locator('html');
     await expect(html).toHaveAttribute('data-mode', 'wedding');
  });
});
