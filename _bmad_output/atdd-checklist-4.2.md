# ATDD Checklist - Epic 4, Story 2: Performance & Motion Tuning (Device Tiering)

**Date:** 2026-02-07
**Author:** Z3tz3r0
**Primary Test Level:** E2E

---

## Story Summary

This story introduces device-tier based graceful degradation so low-power devices avoid heavy motion and autoplay costs while high-end devices keep premium cinematic behavior. The RED-phase tests define expected capability signaling and autoplay gating before implementation begins.

**As a** User on an old mobile phone
**I want** the site to remain usable without heavy effects
**So that** I can still consume content without crashes or degraded stability

---

## Acceptance Criteria

1. Given low-power device conditions (`hardwareConcurrency`, `Save-Data`), heavy parallax/blur should be disabled and video loops should not autoplay.
2. Given high-end device conditions, full cinematic experience should remain enabled.

---

## Failing Tests Created (RED Phase)

### E2E Tests (3 tests)

**File:** `tests/e2e/performance-motion-tiering.spec.ts` (40 lines)

- ✅ **Test:** GIVEN low-power conditions WHEN page loads THEN app marks low tier
  - **Status:** RED - Missing `data-device-tier="low"` on `<html>`
  - **Verifies:** Low-tier capability classification is surfaced to UI/runtime.

- ✅ **Test:** GIVEN high-end conditions WHEN page loads THEN app marks high tier
  - **Status:** RED - Missing `data-device-tier="high"` on `<html>`
  - **Verifies:** High-tier capability classification is surfaced to UI/runtime.

- ✅ **Test:** GIVEN low-power conditions WHEN project media renders THEN video autoplay is disabled
  - **Status:** RED - Video still has `autoplay` attribute under constrained profile.
  - **Verifies:** Autoplay gating is enforced for constrained devices.

### API Tests (0 tests)

**File:** `N/A`

No API contract behavior was required by AC for this story.

### Component Tests (0 tests)

**File:** `N/A`

This iteration prioritizes user-facing acceptance behavior at E2E level.

---

## Data Factories Created

### Device Tier Factory

**File:** `tests/support/factories/device-tier.factory.ts`

**Exports:**

- `createLowTierProfile(overrides?)` - Generates constrained-device profile
- `createHighTierProfile(overrides?)` - Generates capable-device profile

**Example Usage:**

```typescript
const low = createLowTierProfile({ saveData: true });
const high = createHighTierProfile({ hardwareConcurrency: 12 });
```

---

## Fixtures Created

### Device Tier Fixtures

**File:** `tests/support/fixtures/device-tier.fixture.ts`

**Fixtures:**

- `mockDeviceProfile` - Injects mocked browser capability signals before navigation
  - **Setup:** Adds init script overriding `navigator` capability fields + motion query
  - **Provides:** A typed helper callable inside tests
  - **Cleanup:** Browser context teardown after test

- `lowTierProfile` / `highTierProfile`
  - **Setup:** Prebuilt deterministic profiles from factory
  - **Provides:** Reusable capability presets
  - **Cleanup:** Per-test isolation through Playwright fixture lifecycle

---

## Mock Requirements

No external third-party service mocks are required for this story's AC coverage.

---

## Required data-testid Attributes

### Work Detail / Media Surfaces

- `gallery-item-video` - Video container in media gallery (already present)
- `mode-switcher` - Mode toggle surface for transition-related validation (already present)

### Runtime Device Tier Marker (Implementation Requirement)

- Add `data-device-tier` on `<html>` with values: `low | medium | high`

**Implementation Example:**

```tsx
<html data-device-tier="low" />
```

---

## Implementation Checklist

### Test: low tier marker appears

**File:** `tests/e2e/performance-motion-tiering.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement `src/lib/performance/deviceTier.ts` classifier
- [ ] Implement `src/hooks/useDeviceTier.ts` and connect to runtime
- [ ] Set `<html data-device-tier="...">` from resolved capability tier
- [ ] Run test: `npx playwright test tests/e2e/performance-motion-tiering.spec.ts --project=chromium`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Test: high tier marker appears

**File:** `tests/e2e/performance-motion-tiering.spec.ts`

**Tasks to make this test pass:**

- [ ] Ensure classifier emits `high` for capable profiles
- [ ] Ensure SSR/client hydration keeps tier marker stable
- [ ] Run test: `npx playwright test tests/e2e/performance-motion-tiering.spec.ts --project=chromium`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1.0 hours

---

### Test: autoplay disabled for low tier

**File:** `tests/e2e/performance-motion-tiering.spec.ts`

**Tasks to make this test pass:**

- [ ] Update `src/components/page/sections/hero/VideoLoop.tsx` to gate autoplay by tier
- [ ] Update `src/components/page/sections/media-gallery/VideoItem.tsx` to skip `play()` in constrained profile
- [ ] Preserve poster/paused rendering behavior when autoplay is disallowed
- [ ] Run test: `npx playwright test tests/e2e/performance-motion-tiering.spec.ts --project=chromium`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

## Running Tests

```bash
# Run all failing tests for this story
npx playwright test tests/e2e/performance-motion-tiering.spec.ts --project=chromium

# Run specific test file
npx playwright test tests/e2e/performance-motion-tiering.spec.ts

# Run tests in headed mode (see browser)
npx playwright test tests/e2e/performance-motion-tiering.spec.ts --project=chromium --headed

# Debug specific test
npx playwright test tests/e2e/performance-motion-tiering.spec.ts --project=chromium --debug

# Run tests with coverage
N/A (coverage pipeline not configured for Playwright in this repo)
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

- ✅ Failing acceptance tests created
- ✅ Factory + fixture infrastructure created
- ✅ Expected runtime markers and autoplay constraints codified

### GREEN Phase (DEV Team - Next Steps)

1. Implement `deviceTier` utility + `useDeviceTier` hook
2. Integrate tier signal into root runtime (`data-device-tier`)
3. Gate motion/autoplay behavior in transition + video components
4. Re-run E2E file until all tests pass

### REFACTOR Phase (DEV Team - After All Tests Pass)

1. Deduplicate capability checks into shared hook/utility
2. Keep behavior deterministic across browsers with missing network APIs
3. Re-run full related suites (`global-transition`, `media-gallery`, `mode-persistence`)

---

## Next Steps

1. Share this checklist and failing tests with dev workflow (manual handoff)
2. Run RED command to verify local baseline
3. Implement one failing test at a time
4. Move story to `in-progress` when development starts

---

## Knowledge Base References Applied

- Applied local skill guidance: `playwright-best-practices` (target-first selectors, state-based waits, no hard waits)
- Applied existing project test patterns from:
  - `tests/e2e/seo-metadata-perfection.spec.ts`
  - `tests/e2e/media-gallery-hybrid.spec.ts`
  - `tests/support/fixtures/index.ts`

**Note:** `_bmad/bmm/testarch/tea-index.csv` and referenced TEA knowledge fragments were not found in this installation, so equivalent in-repo patterns were used as fallback.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npx playwright test tests/e2e/performance-motion-tiering.spec.ts --project=chromium`

**Results:**

```text
3 failed
- Expected html[data-device-tier="low"] but attribute missing
- Expected html[data-device-tier="high"] but attribute missing
- Expected video without autoplay in low-power profile, but autoplay present
```

**Summary:**

- Total tests: 3
- Passing: 0 (expected)
- Failing: 3 (expected)
- Status: ✅ RED phase verified

**Expected Failure Messages:**

- `toHaveAttribute('data-device-tier', 'low')` failed on `<html>`
- `toHaveAttribute('data-device-tier', 'high')` failed on `<html>`
- `not.toHaveAttribute('autoplay', '')` failed on gallery video element

---

## Notes

- Story file source: `_bmad_output/implementation-artifacts/4-2-performance-motion-tuning-device-tiering.md`
- Framework config source: `playwright.config.ts`
- This ATDD output is for manual handoff and is not auto-consumed by later workflows.

---

**Generated by BMad TEA Agent** - 2026-02-07
