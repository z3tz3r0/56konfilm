import fs from 'node:fs';
import path from 'node:path';

import type { BrowserContext, Page } from '@playwright/test';
import jwt from 'jsonwebtoken';

import {
    IMAGE_SIZE_WARNING_MESSAGE,
    MAX_IMAGE_SIZE_BYTES,
    validateImageAssetSizeWarning,
} from '@/sanity/schemaTypes/objects/backgroundMedia';
import { expect, test } from '../../support/fixtures';

const cmsSessionSecret = process.env.SANITY_CMS_SESSION_SECRET;
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

/**
 * IMPORTANT: Sanity Studio E2E Testing Limitations
 *
 * These tests use Sanity's internal data-testid selectors which are NOT officially
 * documented and may change between Sanity versions. The selectors used are:
 * - [data-testid="pane"] - Main content pane
 * - [data-testid="pane-item"] - Document type list items
 * - [data-testid="add-button"] - Create new document button
 * - [data-testid="publish-button"] - Publish action button
 *
 * If tests start failing after a Sanity upgrade, these selectors may need updating.
 * Consider using aria-labels or visible text as fallbacks.
 */
async function loginToStudio(page: Page, context: BrowserContext) {
  if (!cmsSessionSecret) {
    test.skip(true, 'SANITY_CMS_SESSION_SECRET is required. See tests/README.md for setup.');
  }

  const token = jwt.sign({ username: 'e2e-admin' }, cmsSessionSecret as string, {
    expiresIn: '1h',
  });

  await context.addCookies([
    {
      name: 'sanity-cms-session',
      value: token,
      url: baseUrl,
      httpOnly: true,
      sameSite: 'Strict',
      expires: Math.floor(Date.now() / 1000) + 60 * 60,
    },
  ]);

  await page.goto('/sanity-cms');
  await expect(page).toHaveURL(/\/sanity-cms/);
  await expect(page.locator('[data-testid="pane"]')).toBeVisible({ timeout: 30000 });
}

/**
 * Story 4.3: CMS Validation & Safeguards (No-Code Sanctity)
 */
test.describe('Sanity Studio Validation & Safeguards', () => {
  test('AC 2: should block publishing a Project when required fields are missing', async ({
    page,
    context,
  }) => {
    await loginToStudio(page, context);

    await page.click('[data-testid="pane-item"]:has-text("Project")');
    await page.click('[data-testid="add-button"]');

    const publishButton = page.locator('[data-testid="publish-button"]');
    await expect(publishButton).toBeDisabled();

    await expect(page.getByText('Project title is required before publishing.')).toBeVisible();
    await expect(
      page.getByText('URL Slug is required for the project to be viewable on the site.')
    ).toBeVisible();
    await expect(
      page.getByText('At least one site mode (Production/Wedding) must be selected.')
    ).toBeVisible();
  });

  /**
   * AC 1: Image size validation logic test.
   *
   * NOTE: This tests the validation function directly rather than via Sanity Studio UI.
   * True E2E testing of image upload warnings in Sanity Studio is impractical because:
   * 1. It requires uploading real files through Sanity's asset pipeline
   * 2. The warning appears asynchronously after asset metadata is fetched
   * 3. Sanity Studio's internal state management is complex
   *
   * The validation logic is thoroughly tested here and in unit tests.
   * See: tests/unit/sanity/backgroundMediaValidation.test.ts
   */
  test('AC 1: should return warning when an image exceeds 1MB (validation logic)', async () => {
    const result = await validateImageAssetSizeWarning(
      { asset: { _ref: 'image-abc-123' } },
      {
        getClient: () => ({
          fetch: async () => ({ size: 5_000_000 }),
        }),
      }
    );

    expect(result).toBe(IMAGE_SIZE_WARNING_MESSAGE);
  });

  /**
   * AC 1: Boundary test - exactly at limit should pass (M3 fix).
   */
  test('AC 1: should NOT warn when image is exactly 1MB (boundary)', async () => {
    const result = await validateImageAssetSizeWarning(
      { asset: { _ref: 'image-boundary' } },
      {
        getClient: () => ({
          fetch: async () => ({ size: MAX_IMAGE_SIZE_BYTES }),
        }),
      }
    );

    expect(result).toBe(true);
  });

  test('AC 3: should NOT contain HTML Embed or Code schema fields', async () => {
    const schemaRoot = path.join(process.cwd(), 'src', 'sanity', 'schemaTypes');

    const stack = [schemaRoot];
    const schemaFiles: string[] = [];

    while (stack.length > 0) {
      const currentDir = stack.pop();
      if (!currentDir) {
        continue;
      }

      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          stack.push(fullPath);
          continue;
        }

        if (entry.isFile() && fullPath.endsWith('.ts')) {
          schemaFiles.push(fullPath);
        }
      }
    }

    const forbiddenMatches: string[] = [];

    for (const filePath of schemaFiles) {
      const content = fs.readFileSync(filePath, 'utf8');

      if (/type:\s*['\"]code['\"]/i.test(content)) {
        forbiddenMatches.push(`${filePath}: code type`);
      }

      if (/HTML Embed|type:\s*['\"]html['\"]/i.test(content)) {
        forbiddenMatches.push(`${filePath}: html/embed type`);
      }
    }

    expect(forbiddenMatches).toEqual([]);
  });
});
