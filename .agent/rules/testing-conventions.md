---
trigger: always_on
---

# Testing Conventions (Playwright)

**Scope:** Apply these rules to files in `tests/**`.

## Core Configuration
- **Framework:** Playwright (TypeScript)
- **Base Mode:** Tests should assume `production` (Dark Mode) as the default state.
- **Config:** `playwright.config.ts` enforces `colorScheme: 'dark'`.

## Fixtures & State
Use the custom fixtures defined in `tests/support/fixtures/index.ts`:
- **`setMode(mode)`**: 
  - Sets the `mode` cookie for the current domain context.
  - Automatically reloads/navigates to ensure state application.
  - Usage: `await setMode('wedding');`
- **`siteMode`**:
  - Resolves the current visible mode by checking the `html` class (`dark` vs `light`).

## Selector Strategy (Strict)
1.  **`data-testid`**: Primary selector. Use `page.getByTestId('id')`.
2.  **Mobile Awareness**:
    - Elements hidden behind the mobile menu must be revealed first.
    - Use: `await page.getByTestId('mobile-menu-button').click();` if `isMobile` is true.
3.  **Visibility Filtering**:
    - For elements that exist in both Mobile and Desktop DOMs (but only one is visible), use:
      ```typescript
      .filter({ visible: true })
      ```

## Theme/Mode Assertions
Do **not** rely on `body` classes. `next-themes` applies classes to `html`.
- **Production (Dark):**
  ```typescript
  await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 10000 });
  ```
- **Wedding (Light):**
  ```typescript
  await expect(page.locator('html')).toHaveClass(/light/, { timeout: 10000 });
  ```
*Note: We use `toPass` or long timeouts for assertions that depend on Cookie->Theme sync.*

## Execution
- **Run E2E:** `npm run test:e2e`
