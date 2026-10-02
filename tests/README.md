# 56konfilm Test Suite

The test suite uses **Vitest** for unit, component and in-process route regression tests, and **Playwright** for browser/API checks against a running application.

## Directory Structure

```plaintext
tests/
├── unit/                     # Vitest tests, including mocked Auth route regressions
├── api/                      # Playwright API checks; excluded from Vitest
├── e2e/                      # Playwright browser tests
├── support/
│   ├── factories/            # Deterministic test data
│   └── fixtures/             # Playwright mode/device fixtures
├── setup.ts                  # Vitest DOM matchers and test environment defaults
└── README.md
```

## Setup and Commands

Use the repository's existing dependencies and scripts; no separate test dependency installation is needed after `pnpm install`.

```bash
pnpm test
pnpm test:watch
pnpm type-check
pnpm lint
```

`pnpm test` runs Vitest with `vitest.config.ts` (jsdom, global test APIs, shared setup and application aliases). It excludes `tests/api/` and `tests/e2e/`. Auth route regression tests live in `tests/unit/` and call handlers in-process rather than starting a web server.

### Unit Tests Without Reading Local Environment Files

The ordinary Vitest setup loads local environment configuration. For isolated mocked regression checks, disable both loading paths:

- `SKIP_TEST_DOTENV=true` prevents `tests/setup.ts` from loading `.env.local`.
- Vite's `envFile: false` also prevents automatic environment-file loading. The skip flag alone does not disable this second path.

Run the following command from the repository root (also works in PowerShell):

```bash
node --input-type=module -e "process.env.SKIP_TEST_DOTENV='true'; const { startVitest } = await import('vitest/node'); const ctx = await startVitest('test', [], { run: true, maxWorkers: 4 }, { envFile: false }); if (ctx) await ctx.close();"
```

For focused checks, replace `[]` with filters such as `['tests/unit/auth-password.spec.ts', 'tests/unit/auth-session.spec.ts']`.

This does not clear inherited process environment variables or automatically block networking. Use explicit test values and mock the relevant environment modules, Sanity clients, provider adapters or HTTP transport so tests do not depend on secrets or call real services. Do not log credentials or inspect real environment files to debug a mocked test.

## Shared Utility and Auth Regression Patterns

- Import utilities directly from implementation files, including type-only imports. There are no utility `index.ts` files, and mock paths must follow the same direct-import convention.
- Verify URL/Maps parsing, preference precedence, SEO output, device-tier detection and styling helpers without changing their existing behavior.
- Keep Auth and Contact limiter tests separate: check attempt counts, reset boundaries, cleanup and independent counters using controlled time.
- Importing client-safe utilities or the Contact limiter must not start the Auth cleanup timer. Tests that import the Auth limiter must clean up timers.
- Mock bcrypt and JWT to verify password/session integration contracts; test password-strength validation using the real application rules.
- Mock Sanity credential operations and verify existing query, patch and failure behavior.
- For Auth routes, mock credentials, session helpers, environment configuration, rate limits and cookies. Assert status codes, response bodies, cookie behavior and validation on success and failure without real network requests.

Examples of direct utility imports:

```typescript
import { validatePasswordStrength } from '@shared/utils/password/passwordValidation';
import { checkContactRateLimit } from '@shared/utils/rate-limit/contactRateLimit';
import { cn } from '@shared/utils/styling/tailwindUtils';
```

## Media Gallery and Featured Projects Regressions

These suites cover Gallery presentation, CMS validation, data projection and Featured Projects regressions. The checklist below describes browser verification separately from mocked unit/component coverage.

| Test file under `tests/unit/`                  | Coverage                                                                                                                                                             |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sanity/mediaGallerySection.test.ts`           | Wedding-only visual options, conditional field visibility, Grid item requirements, required Collage H2/assets and Studio preview                                     |
| `mediaGalleryQueries.test.ts`                  | Full page-query projection, named image slots, localized alt fallbacks, retained inactive data and legacy project arrays/order/limits/missing references             |
| `components/MediaGallerySection.spec.tsx`      | Mode/variant selection, EN/TH, CTA, image transforms/ratios, placeholders, background choices, static fallback, replay after image edits and legacy Grid media/links |
| `components/AnimatedCollageImage.spec.tsx`     | Shared reveal timings/viewport configuration and initialized low-tier static rendering                                                                               |
| `sanity/featuredProjectsSection.test.ts`       | Required main heading, shared curated selection rules in both modes and content-source preview                                                                       |
| `featuredProjectQueries.test.ts`               | Latest/curated project results, locale projection, selection order, limits and unresolved/missing references                                                         |
| `components/PortfolioRevealConsumers.spec.tsx` | Featured Projects latest/curated consumers in both modes and the existing Portfolio page/reveal integration                                                          |

For a focused run without reading local environment files, use the same isolation settings as above:

```bash
node --input-type=module -e "process.env.SKIP_TEST_DOTENV='true'; const { startVitest } = await import('vitest/node'); const ctx = await startVitest('test', ['tests/unit/sanity/mediaGallerySection.test.ts', 'tests/unit/mediaGalleryQueries.test.ts', 'tests/unit/components/MediaGallerySection.spec.tsx', 'tests/unit/components/AnimatedCollageImage.spec.tsx', 'tests/unit/sanity/featuredProjectsSection.test.ts', 'tests/unit/featuredProjectQueries.test.ts', 'tests/unit/components/PortfolioRevealConsumers.spec.tsx'], { run: true, maxWorkers: 2 }, { envFile: false }); if (ctx) await ctx.close();"
```

Query tests evaluate the real GROQ against an in-memory dataset using the installed `groq-js` dependency; they do not query a live Sanity dataset. Component tests mock hooks, Motion/Next Image or services as appropriate. Keep mock/import paths aligned with `components/collage/`, `components/grid/` and `types/presentation.types.ts`; do not expose private components just to test them.

### Gallery Browser Verification

The committed component tests validate markup/classes and contracts, not browser-computed geometry or a full-app transition. Record any offline browser-fixture checks separately from committed automated coverage and actual application E2E.

When application access is permitted, check widths 320/375/768/1024/1280/1920px and verify:

- Production and Wedding Grid retain existing image/video/project behavior; data without a variant remains Grid.
- Wedding Collage below `lg` hides the large left image and places optional eyebrow → small image → H2 → optional body → optional CTA → landscape in order. Long text and missing optional fields do not cause horizontal overflow.
- At `lg` (1024px) and above, the collage panel occupies 60% of the container and aligns right. Below `lg` it fills the container. The standard container is at most 1280px on the default spacing scale; the backdrop ends at the midpoint of the lower **frame**, including its padding.
- Default, empty and missing background values add no panel color. Muted/Contrast use theme tokens, Contrast text remains legible, and frame/placeholder backgrounds remain independent.
- Photo crops respect the Sanity editor's settings, collage images have no links, and the CTA uses the configured destination safely.
- Reveals use the shared stagger timing; scrolling out and back does not replay a mounted wrapper. Text-only changes preserve wrappers, while image-data/locale changes remount them. Initialized devices that disallow heavy motion display static content.

Stable selectors include `wedding-gallery-panel`, `wedding-gallery-landscape-backdrop`, `wedding-gallery-image` and `gallery-item-image`/`gallery-item-video`/`gallery-item-project`. The static Collage fallback intentionally has no `wedding-gallery-image` motion-wrapper test ID; assert its image or placeholder content instead.

For offline geometry checks, use fixture markup with the project's CSS and block all network requests. If Motion and Next Image are mocked, report that limitation: such a fixture does not verify real image loading, motion playback, live Studio publishing or full-app E2E. Do not introduce a separate test application or root configuration just to perform these checks.

## Playwright Browser and API Checks

Install the browsers when setting up a machine:

```bash
pnpm exec playwright install
```

Run checks against an environment where application access and any external data reads are permitted:

```bash
pnpm test:e2e
pnpm exec playwright test tests/e2e --ui
pnpm exec playwright test tests/e2e --debug
pnpm exec playwright test tests/e2e --headed
pnpm exec playwright test tests/api
```

The current Playwright configuration loads local environment configuration and can start `pnpm run dev`; the application may fetch real Sanity content. These commands are **not** the isolated mocked checks above. Do not run them when accessing real environment files or services is prohibited. Similarly, `pnpm build` may require real CMS data; mocked unit tests do not establish that a production build or browser checks passed.

### Fixtures and Selectors

`tests/support/fixtures/index.ts` provides:

- `setMode('production' | 'wedding')`: sets the mode cookie for the local test site.
- `siteMode`: derives the active theme from the page.

Use `data-testid` selectors for stable browser checks, for example `page.locator('[data-testid="mode-switcher"]')`.

### Current Playwright Configuration

- Tests can run in parallel; CI uses one worker and retries failures twice.
- Screenshots, videos and traces are retained on failure.
- The configured development server starts automatically and can reuse a running local server outside CI.
- Browser projects cover desktop Chromium, Firefox and Mobile Chrome.

## Reporting Verification

Record type-check, lint, relevant unit tests and formatting results separately from build/E2E evidence. If external-service restrictions prevent build or Playwright checks, state that explicitly rather than marking them as passed.
