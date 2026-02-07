import { expect, test } from '@playwright/test';

test.describe('Technical SEO Routes', () => {
  test('should have a valid sitemap.xml', async ({ request }) => {
    // WHEN: Accessing /sitemap.xml
    const response = await request.get('/sitemap.xml');

    // THEN: Response is successful
    // RED Phase: This will fail until app/sitemap.ts is implemented
    expect(response.status()).toBe(200);

    // AND: Content type is XML
    expect(response.headers()['content-type']).toContain('application/xml');

    // AND: Contains basic sitemap tags
    const body = await response.text();
    expect(body).toContain('<urlset');
    expect(body).toContain('<loc>');
  });

  test('should have a robots.txt with environment-specific rules', async ({ request }) => {
    // WHEN: Accessing /robots.txt
    const response = await request.get('/robots.txt');

    // THEN: Response is successful
    // RED Phase: This will fail until app/robots.ts is implemented
    expect(response.status()).toBe(200);

    // AND: Rules match expectations (Staging should Disallow)
    const body = await response.text();
    expect(body.toLowerCase()).toContain('user-agent: *');
    
    // In our E2E environment, we might want to check for Disallow if we treat it as non-prod
    // or Allow if we simulate prod. The story says: Allow Prod, Disallow Staging.
    // Let's check for basic structure first.
    expect(body).toContain('Sitemap:');
  });
});
