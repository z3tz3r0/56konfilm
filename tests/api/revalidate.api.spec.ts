import { expect, test } from '@playwright/test';

test.describe('Sanity Revalidation API', () => {
  const REVALIDATE_PATH = '/api/revalidate';
  const VALID_SECRET = 'test-secret';

  test('should return 401 if secret is missing', async ({ request }) => {
    // GIVEN: A request without authorization secret
    // WHEN: POSTing to revalidate endpoint
    const response = await request.post(REVALIDATE_PATH, {
      data: {
        _type: 'project',
        slug: { current: 'test-project' }
      }
    });

    // THEN: Return Unauthorized
    expect(response.status()).toBe(401);
  });

  test('should return 400 if payload is invalid', async ({ request }) => {
    // GIVEN: A request with valid secret but empty body
    // WHEN: POSTing to revalidate endpoint
    const response = await request.post(REVALIDATE_PATH, {
      headers: {
        'x-sanity-signature': 'mock-valid-signature' // parseBody would handle this
      },
      data: {}
    });

    // THEN: Return Bad Request
    expect(response.status()).toBe(400);
  });

  test('should return 200 and revalidate: true for valid payload', async ({ request }) => {
    // GIVEN: A valid request with secret and correct payload
    // WHEN: POSTing to revalidate endpoint
    const response = await request.post(REVALIDATE_PATH, {
      headers: {
        'x-sanity-signature': 'mock-valid-signature' 
      },
      data: {
        _type: 'project',
        slug: { current: 'test-project' }
      }
    });

    // THEN: Return Success
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.revalidated).toBe(true);
  });
});
