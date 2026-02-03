# ATDD Checklist - Epic 3, Story 3.1: Wedding Mode Skinning

**Date:** 2026-02-03
**Author:** Z3tz3r0
**Primary Test Level:** E2E

---

## Story Summary

**As a** Visitor
**I want** the website to change its entire look and feel when I switch to Wedding Mode
**So that** I feel I am in a romantic, studio environment rather than a raw production house.

---

## Acceptance Criteria

1. **Given** I click "Wedding Mode" in the `ModeSwitcher`
   **When** the `GlobalTransition` (CurtainWipe) completes
   **Then** the `html[data-mode]` should update to `wedding`
   **And** the theme variables in `globals.css` should switch to Wedding values (Ivory White bg, Brown text).

2. **Given** I am in **Wedding Mode**
   **Then** the primary font should switch from `Sora` (Production) to `Cormorant Garamond` (Wedding) for headers
   **And** the `ModeSwitcher` indicator should slide smoothly to the Wedding position.

3. **Given** various sections (Hero, TwoColumn, etc.)
   **When** viewed in Wedding Mode
   **Then** they must use the `--color-ivory-white`, `--color-brown`, and `--color-mocha-brown` variables.

4. **Given** I navigate between pages (Home, About, Contact)
   **When** I am in Wedding Mode
   **Then** the "Skin" must persist correctly across all routes.

---

## Failing Tests Created (RED Phase)

### E2E Tests (4 tests)

**File:** `tests/e2e/wedding-mode-skinning.spec.ts`

- ✅ **Test:** should apply Wedding theme variables when mode is active
  - **Status:** RED
  - **Failure:** `expect(received).toHaveCSS(expected)` - Background color check failed.
  - **Verifies:** `globals.css` variable application for Wedding mode.

- ✅ **Test:** should switch typography to Cormorant Garamond in Wedding Mode
  - **Status:** RED
  - **Failure:** `expect(received).toHaveCSS(expected)` - Font family check failed.
  - **Verifies:** Typography switching logic.

- ✅ **Test:** should persist wedding skin across navigation
  - **Status:** RED
  - **Failure:** `expect(locator).toHaveAttribute(expected)` ("wedding") - `data-mode` missing or incorrect.
  - **Verifies:** `ModeProvider` and cookie persistence across routes.

- ✅ **Test:** should revert to Production skin when toggled back
  - **Status:** RED
  - **Failure:** `expect(locator).toHaveAttribute(expected)` - Failures cascade from initial setup failure.
  - **Verifies:** Toggle mechanism reliability.

---

## Data Factories Created

N/A - Using project's existing static pages (`/`) and navigation.

---

## Fixtures Created

### Mode Fixtures (Existing)

**File:** `tests/support/fixtures/index.ts`

- `setMode(mode)` - Sets the mode cookie and reloads the page to simulate a returning user or server-side render state.
- `isMobile` - Standard viewport detection.

---

## Required data-testid Attributes

### ModeSwitcher component
- `mode-switcher` - The container of the switcher.
- `mobile-menu-button` - Hamburger menu for mobile tests.

---

## Implementation Checklist

### Test: should apply Wedding theme variables when mode is active

**File:** `tests/e2e/wedding-mode-skinning.spec.ts`

**Tasks to make this test pass:**
- [ ] Verify `ModeProvider` logic updates `html[data-mode]` client-side.
- [ ] Ensure `layout.tsx` passes correct `initialMode` to `ModeProvider`.
- [ ] Run test: `npm run test:e2e -- wedding-mode-skinning.spec.ts`
- [ ] ✅ Test passes (green phase)

### Test: should switch typography to Cormorant Garamond in Wedding Mode

**File:** `tests/e2e/wedding-mode-skinning.spec.ts`

**Tasks to make this test pass:**
- [ ] Verify `globals.css` defines `Cormorant Garamond` for `h1-h4` when `[data-mode='wedding']` (or root default).
- [ ] Ensure font variable `--font-cormorant-garamond` is correctly loaded in `layout.tsx`.
- [ ] Run test: `npm run test:e2e -- wedding-mode-skinning.spec.ts`
- [ ] ✅ Test passes (green phase)

### Test: should persist wedding skin across navigation

**File:** `tests/e2e/wedding-mode-skinning.spec.ts`

**Tasks to make this test pass:**
- [ ] Debug `ModeProvider` to ensure it writes to document root `data-mode`.
- [ ] Verify `next-themes` isn't conflicting (e.g. overwriting classes without using `data-mode`).
- [ ] Run test: `npm run test:e2e -- wedding-mode-skinning.spec.ts`
- [ ] ✅ Test passes (green phase)

---

## Running Tests

```bash
# Run all failing tests for this story
npm run test:e2e -- wedding-mode-skinning.spec.ts

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed wedding-mode-skinning.spec.ts
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**
- ✅ All tests written and failing
- ✅ Implementation checklist created

### GREEN Phase (DEV Team - Next Steps)

1. **Pick one failing test**
2. **Implement minimal code**
3. **Run the test**
4. **Repeat**

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npm run test:e2e -- wedding-mode-skinning.spec.ts`

**Results:**
12 failed tests (across browsers).
Failure: `Locator: locator('html') Expected: "wedding" Received: ""`

**Status:** ✅ RED phase verified.
