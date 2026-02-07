import { expect, test } from '@playwright/test';

test.describe('Debug Mode', () => {
  test('should have data-mode attribute', async ({ page }) => {
    // page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    await page.goto('/');
    // await page.waitForTimeout(2000); // Removed arbitrary wait
    const html = await page.content();
    expect(html).toContain('<html');

    const mode = await page.getAttribute('html', 'data-mode');
    expect(mode).toMatch(/^(production|wedding)$/);

    const classes = await page.getAttribute('html', 'class');
    expect(classes ?? '').not.toEqual('');

    const h1Font = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? getComputedStyle(h1).fontFamily : 'NO H1';
    });
    expect(h1Font).not.toEqual('');

    const bodyFont = await page.evaluate(() => {
      return getComputedStyle(document.body).fontFamily;
    });
    expect(bodyFont).not.toEqual('');

    const soraVar = await page.evaluate(() => {
      return getComputedStyle(document.body).getPropertyValue('--font-sora');
    });
    expect(soraVar).toBeDefined();

    const cormorantVar = await page.evaluate(() => {
      return getComputedStyle(document.body).getPropertyValue('--font-cormorant-garamond');
    });
    expect(cormorantVar).toBeDefined();
  });
});
