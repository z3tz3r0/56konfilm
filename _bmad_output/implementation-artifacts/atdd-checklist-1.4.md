# ATDD Checklist - Epic 1, Story 1.4: Bilingual SEO Foundation for Commercial

**Date:** 2026-02-01
**Author:** Z3tz3r0
**Primary Test Level:** E2E

---

## Story Summary

As a **Search Engine (Google)**, I want **to clearly understand which content is Thai vs English**, So that **I can serve the correct language version to the correct user.**

---

## Acceptance Criteria

1. HTML & SEO Structure (`lang` & `hreflang`)
2. Next.js 16 Proxy (formerly Middleware) for `Accept-Language`
3. Language Switching (Soft Navigation)
4. Sanity Content Localization

---

## Failing Tests Created (RED Phase)

### E2E Tests (4 tests)

**File:** `tests/e2e/bilingual-seo.spec.ts`

- ✅ **Test:** should render English version correctly by default
  - **Status:** RED - Missing `hreflang` tags and potentially `canonical` tags.
  - **Verifies:** Default EN rendering and metadata.

- ✅ **Test:** should render Thai version when accessing /th path
  - **Status:** RED - `/th` route likely 404s or doesn't set `lang="th"`.
  - **Verifies:** Path-based routing and localized HTML attribute.

- ✅ **Test:** should switch language via UI
  - **Status:** RED - `data-testid="language-switcher-th"` not found.
  - **Verifies:** Soft navigation and URL update.

- ✅ **Test:** should redirect/rewrite based on Accept-Language header
  - **Status:** RED - Proxy logic not implemented.
  - **Verifies:** Auto-detection of user preference.

---

## Required data-testid Attributes

### Navigation / Header

- `language-switcher-th` - Button/Link to switch to Thai
- `language-switcher-en` - Button/Link to switch to English (implied for symmetry)

---

## Implementation Checklist

### Test: should render English version correctly by default

**File:** `tests/e2e/bilingual-seo.spec.ts`

- [ ] Update `src/app/layout.tsx` (move to `src/app/[lang]/layout.tsx`) to set `lang` dynamically.
- [ ] Implement `generateMetadata` to output `hreflang` tags.
- [ ] Run test: `npx playwright test tests/e2e/bilingual-seo.spec.ts --grep "English version"`
- [ ] ✅ Test passes (green phase)

### Test: should render Thai version when accessing /th path

**File:** `tests/e2e/bilingual-seo.spec.ts`

- [ ] Refactor project structure to `src/app/[lang]`.
- [ ] Ensure `generateStaticParams` covers `en` and `th`.
- [ ] Run test: `npx playwright test tests/e2e/bilingual-seo.spec.ts --grep "Thai version"`
- [ ] ✅ Test passes (green phase)

### Test: should switch language via UI

**File:** `tests/e2e/bilingual-seo.spec.ts`

- [ ] Create `LanguageSwitcher` component.
- [ ] Add `data-testid="language-switcher-th"`.
- [ ] Run test: `npx playwright test tests/e2e/bilingual-seo.spec.ts --grep "switch language"`
- [ ] ✅ Test passes (green phase)

### Test: should redirect/rewrite based on Accept-Language header

**File:** `tests/e2e/bilingual-seo.spec.ts`

- [ ] Update `src/proxy.ts` to inspect headers and rewrite/redirect.
- [ ] Run test: `npx playwright test tests/e2e/bilingual-seo.spec.ts --grep "Accept-Language"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

## Running Tests

```bash
# Run all failing tests for this story
npx playwright test tests/e2e/bilingual-seo.spec.ts

# Run tests in headed mode
npx playwright test tests/e2e/bilingual-seo.spec.ts --headed
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

- ✅ All tests written and failing
- ✅ `data-testid` requirements listed
- ✅ Implementation checklist created

### GREEN Phase (DEV Team - Next Steps)

1. **Pick one failing test**
2. **Implement minimal code** (e.g. move layout files)
3. **Run the test**
4. **Move to next test**

---

## Knowledge Base References Applied

- **test-levels-framework.md**: Selected E2E as primary because of Routing/SEO focus.
- **network-first.md**: Not strictly applied yet (no API mocks needed for static SEO tags), but mindful for Sanity fetches if we mock them (we are likely letting them hit live/cache for now or using existing mocks if global).

---

## Output Summary

**Story**: 1.4
**Primary Test Level**: E2E
**Failing Tests Created**: 4 E2E tests

**Next Steps for DEV Team**:
1. Run failing tests: `npx playwright test tests/e2e/bilingual-seo.spec.ts`
2. Follow Implementation Checklist.
