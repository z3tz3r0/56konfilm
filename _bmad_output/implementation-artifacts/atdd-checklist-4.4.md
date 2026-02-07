# ATDD Checklist - Epic 4, Story 4: Final Polish & Deployment Pipeline

**Date:** 2026-02-07
**Author:** Antigravity (Expert CLI Automation Agent)
**Primary Test Level:** API & E2E

---

## Story Summary

Implement the final operational and quality polish for the site by enabling on-demand ISR revalidation via Sanity webhooks and optimizing frontend performance for perfect Lighthouse scores.

**As a** Developer
**I want** the site to automatically revalidate content when Sanity updates
**So that** the owner sees their changes instantly without waiting for a re-deployment.

---

## Acceptance Criteria

1. **Given** I update content in Sanity  
   **When** I click Publish  
   **Then** a Webhook should trigger the Next.js On-demand Revalidation (ISR).

2. **Given** I run a Lighthouse Audit on the final Production build  
   **Then** Performance, Accessibility, Best Practices, and SEO scores should be 95-100.

---

## Failing Tests Created (RED Phase)

### E2E Tests (2 tests)

**File:** `tests/e2e/deployment/revalidation.spec.ts` (26 lines)

- ✅ **Test:** `should have priority LCP image on the homepage`
  - **Status:** RED - Element missing fetchpriority attribute or returning 404/Timeout
  - **Verifies:** LCP hero images are optimized with `fetchpriority="high"` for AC2.
- ✅ **Test:** `should return 401 for unauthorized revalidation requests`
  - **Status:** RED - Received 404 (Endpoint not implemented)
  - **Verifies:** Security layer of the revalidation webhook for AC1.

### API Tests (3 tests)

**File:** `tests/api/revalidate.api.spec.ts` (46 lines)

- ✅ **Test:** `should return 401 if secret is missing`
  - **Status:** RED - Received 404 (Endpoint not implemented)
  - **Verifies:** Unsigned requests are blocked.
- ✅ **Test:** `should return 400 if payload is invalid`
  - **Status:** RED - Received 404 (Endpoint not implemented)
  - **Verifies:** Malformed payloads are handled.
- ✅ **Test:** `should return 200 and revalidate: true for valid payload`
  - **Status:** RED - Received 404 (Endpoint not implemented)
  - **Verifies:** Successful cache purging triggered by Sanity.

---

## Data Factories Created

*None created for this story. Static mock JSON payloads are defined within test files to minimize dependency bloat for simple webhook verification.*

---

## Fixtures Created

*No new fixtures created. Reused existing `setMode` and `siteMode` fixtures from `tests/support/fixtures/index.ts`.*

---

## Mock Requirements

### Sanity Webhook Mock

**Endpoint:** `POST /api/revalidate`

**Success Response:**

```json
{
  "revalidated": true,
  "now": 1738933433000
}
```

**Failure Response:**

```json
{
  "message": "Invalid signature"
}
```

**Notes:** Implementation must use `next-sanity/webhook` to verify `x-sanity-signature`.

---

## Required data-testid Attributes

*No new data-testid attributes required. The tests rely on semantic selectors (header img) and API endpoints.*

---

## Implementation Checklist

### Test: Sanity Revalidation API

**File:** `tests/api/revalidate.api.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/app/api/revalidate/route.ts`
- [ ] Implement signature verification logic
- [ ] Implement `revalidateTag` logic based on document type
- [ ] Run test: `npx playwright test tests/api/revalidate.api.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: Performance Polish (LCP Priority)

**File:** `tests/e2e/deployment/revalidation.spec.ts`

**Tasks to make this test pass:**

- [ ] Identify LCP hero images in homepages (`/en`, `/th`)
- [ ] Add `priority` prop to `next/image` components in Hero sections
- [ ] Run test: `npx playwright test tests/e2e/deployment/revalidation.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

## Running Tests

```bash
# Run all failing tests for this story
npx playwright test tests/api/revalidate.api.spec.ts tests/e2e/deployment/revalidation.spec.ts

# Run specific test file
npx playwright test tests/api/revalidate.api.spec.ts

# Run tests in headed mode (see browser)
npx playwright test tests/e2e/deployment/revalidation.spec.ts --headed

# Debug specific test
npx playwright test tests/api/revalidate.api.spec.ts --debug
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All tests written and failing
- ✅ Mock requirements documented
- ✅ Implementation checklist created

**Verification:**

- All tests run and fail with 404 as expected (endpoint missing).
- Failure messages are clear: `Expected: 401, Received: 404`.

---

### GREEN Phase (DEV Team - Next Steps)

1. **Pick one failing test** from implementation checklist.
2. **Implement minimal code** to make that specific test pass.
3. **Run the test** to verify it now passes (green).
4. **Repeat** for all metrics.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npx playwright test tests/api/revalidate.api.spec.ts tests/e2e/deployment/revalidation.spec.ts`

**Results:**

```
  1) [chromium] › tests/api/revalidate.api.spec.ts:7:7 › Sanity Revalidation API › should return 401 if secret is missing 
     Expected: 401, Received: 404

  2) [chromium] › tests/api/revalidate.api.spec.ts:24:7 › Sanity Revalidation API › should return 400 if payload is invalid 
     Expected: 400, Received: 404

  3) [chromium] › tests/api/revalidate.api.spec.ts:39:7 › Sanity Revalidation API › should return 200 and revalidate: true for valid payload 
     Expected: 200, Received: 404

  4) [chromium] › tests/e2e/deployment/revalidation.spec.ts:3:7 › Deployment & Performance Polish › should have priority LCP image on the homepage 
     Expected: "fetchpriority" attribute "high", Received: null

  5) [chromium] › tests/e2e/deployment/revalidation.spec.ts:18:7 › Deployment & Performance Polish › should return 401 for unauthorized revalidation requests 
     Expected: 401, Received: 404
```

**Summary:**

- Total tests: 5
- Passing: 0 (expected)
- Failing: 5 (expected)
- Status: ✅ RED phase verified

---

**Generated by BMad TEA Agent** - 2026-02-07
