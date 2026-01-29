# 56konfilm Test Suite

This directory contains the production-ready test framework architecture based on **Playwright**.

## Directory Structure

```
tests/
├── e2e/                      # End-to-End test files
│   └── mode-switcher.spec.ts  # Test for dual-identity logic
├── support/                  # Test infrastructure
│   ├── fixtures/             # Custom Playwright fixtures
│   │   └── index.ts          # Mode management fixtures
│   ├── helpers/              # Utility functions (video, etc.)
│   └── page-objects/         # (Optional) Page Object Models
└── README.md                 # This file
```

## Setup Instructions

1.  **Install Dependencies**:
    ```bash
    npm install -D @playwright/test
    npx playwright install
    ```

2.  **Environment Configuration**:
    Copy `.env.example` to `.env` and adjust the `BASE_URL`:
    ```bash
    cp .env.example .env
    ```

3.  **Running Tests**:
    - **All tests**: `npm run test:e2e`
    - **UI Mode**: `npx playwright test --ui`
    - **Debug Mode**: `npx playwright test --debug`
    - **Headed Mode**: `npx playwright test --headed`

## Core Patterns

### Fixtures (`tests/support/fixtures/index.ts`)
We use custom fixtures to manage the site's unique "Dual-Identity" state.
- `setMode('production' | 'wedding')`: Programmatically switches the site theme/content by setting the `mode` cookie.
- `siteMode`: Re-usable fixture that provides the current active mode.

### Selector Strategy
Always prefer **`data-testid`** attributes for reliable testing.
Example: `page.locator('[data-testid="mode-switcher"]')`.

## CI/CD Integration
Tests are configured to:
- Run in parallel.
- Capture **screenshots, videos, and traces** only on failure to optimize storage.
- Auto-start the local dev server if not already running.

---
*Powered by BMAD-CORE™*
