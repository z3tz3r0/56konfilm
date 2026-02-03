
import { test } from '@playwright/test';

test.describe('Debug Mode', () => {
  test('should have data-mode attribute', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    await page.goto('/');
    await page.waitForTimeout(2000);
    const html = await page.content();
    console.log('HTML Content Start:', html.substring(0, 500));
    
    const mode = await page.getAttribute('html', 'data-mode');
    console.log('Data Mode Attribute:', mode);
    
    const classes = await page.getAttribute('html', 'class');
    console.log('HTML Classes:', classes);

    const h1Font = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? getComputedStyle(h1).fontFamily : 'NO H1';
    });
    console.log('H1 Font Family:', h1Font);

    const bodyFont = await page.evaluate(() => {
      return getComputedStyle(document.body).fontFamily;
    });
    console.log('Body Font Family:', bodyFont);

    const soraVar = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--font-sora');
    });
    console.log('--font-sora variable:', soraVar);

    const cormorantVar = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--font-cormorant-garamond');
    });
    console.log('--font-cormorant-garamond variable:', cormorantVar);
  });
});
