# ATDD Checklist - Epic 3, Story 4: Wedding Homepage & Packages

**Date:** 2026-02-05
**Author:** Z3tz3r0
**Primary Test Level:** E2E

---

## Story Summary

Implement the core conversion sections for the Wedding Homepage: Packages, Testimonials, and Philosophy. These sections are critical for the emotional appeal and booking conversion of the wedding production house.

**As a** Couple
**I want** to see wedding packages and testimonials clearly on the homepage
**So that** I can quickly decide if this studio fits my budget and vibe.

---

## Acceptance Criteria

1. **Given** I am on the Wedding Homepage  
   **When** I scroll to the **Packages Section**  
   **Then** I should see a clean Pricing Table (3 tiers as per design assets).

2. **Given** I view the **Testimonials Section**  
   **When** I interact with it  
   **Then** it should be a **Carousel** showing one testimonial at a time  
   **And** I can navigate left/right to read more reviews.

3. **Given** I view the **Philosophy Section**  
   **When** the page loads  
   **Then** it should present the brand story with elegant Serif typography.

4. **Given** all sections are rendered  
   **When** the page loads  
   **Then** all sections should use Wedding mode styling (cream background, serif fonts).

5. **Given** the CMS admin is managing packages  
   **When** they view the Sanity Studio  
   **Then** they should be able to add/edit/remove packages with full detail fields.

---

## Failing Tests Created (RED Phase)

### E2E Tests (4 tests)

**File:** `tests/e2e/wedding-homepage-packages.spec.ts` (60 lines)

- ✅ **Test:** should render Packages Section with 3 distinct tiers
  - **Status:** RED - Timeout waiting for `packages-section`
  - **Verifies:** Visibility of the pricing table and featured package styling.

- ✅ **Test:** should navigate Testimonials Carousel using arrows
  - **Status:** RED - Timeout waiting for `testimonial-section`
  - **Verifies:** Carousel logic and navigation between testimonials.

- ✅ **Test:** should display Philosophy Section with Serif typography
  - **Status:** RED - Timeout waiting for `philosophy-section`
  - **Verifies:** Brand story quote and Serif font application.

- ✅ **Test:** should use Wedding mode color palette consistently
  - **Status:** RED - Timeout waiting for `packages-section`
  - **Verifies:** Background color matching Wedding mode ivory/cream.

---

## Data Factories Created

### Wedding Factory

**File:** `tests/support/factories/wedding.factory.ts`

**Exports:**

- `createPackageItem(overrides?)` - Create pricing tier data
- `createTestimonialItem(overrides?)` - Create user review data
- `createPackagesSection(overrides?)` - Create full section with 3 tiers
- `createTestimonialSection(overrides?)` - Create section with multiple reviews
- `createPhilosophySection(overrides?)` - Create minimal brand quote section

**Example Usage:**

```typescript
import { createPackagesSection } from '../support/factories/wedding.factory';
const mockData = createPackagesSection();
```

---

## Required data-testid Attributes

### Packages Section
- `packages-section` - Outer section container
- `package-card` - Individual pricing tier card
- `[data-featured="true"]` - Attribute to identify the highlighted tier

### Testimonial Section
- `testimonial-section` - Outer section container
- `testimonial-item` - Content of a single review
- `carousel-next` - Button to move to next testimonial
- `carousel-prev` - Button to move to previous testimonial

### Philosophy Section
- `philosophy-section` - Outer section container
- `philosophy-quote` - The main brand quote text

---

## Implementation Checklist

### Test: should render Packages Section with 3 distinct tiers
**File:** `tests/e2e/wedding-homepage-packages.spec.ts`
- [ ] Create `packageItem` object schema in Sanity
- [ ] Create `packagesSection` section schema in Sanity
- [ ] Implement `PackagesSection.tsx` component
- [ ] Add `data-testid="packages-section"` and `package-card`
- [ ] Apply featured styling based on `featured` boolean
- [ ] Run test: `npm run test:e2e -- wedding-homepage-packages.spec.ts`
- [ ] ✅ Test passes (green phase)
**Estimated Effort:** 2 hours

### Test: should navigate Testimonials Carousel using arrows
**File:** `tests/e2e/wedding-homepage-packages.spec.ts`
- [ ] Create `testimonialItem` and `testimonialSection` schema
- [ ] Implement `TestimonialSection.tsx` using `Embla Carousel`
- [ ] Add `data-testid="testimonial-section"`, `testimonial-item`, and `carousel-next`
- [ ] Implement navigation logic
- [ ] Run test: `npm run test:e2e -- wedding-homepage-packages.spec.ts`
- [ ] ✅ Test passes (green phase)
**Estimated Effort:** 2 hours

### Test: should display Philosophy Section with Serif typography
**File:** `tests/e2e/wedding-homepage-packages.spec.ts`
- [ ] Create `philosophySection` schema
- [ ] Implement `PhilosophySection.tsx`
- [ ] Ensure `font-family` is set to Serif (Cormorant Garamond)
- [ ] Add `data-testid="philosophy-section"` and `philosophy-quote`
- [ ] Run test: `npm run test:e2e -- wedding-homepage-packages.spec.ts`
- [ ] ✅ Test passes (green phase)
**Estimated Effort:** 1 hour

---

## Running Tests

```bash
# Run all failing tests for this story
npx playwright test tests/e2e/wedding-homepage-packages.spec.ts

# Run tests in headed mode (see browser)
npx playwright test tests/e2e/wedding-homepage-packages.spec.ts --headed

# Debug specific test
npx playwright test tests/e2e/wedding-homepage-packages.spec.ts --debug
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅
- ✅ All tests written and failing (verified via terminal)
- ✅ Data factories created for all new sections
- ✅ data-testid requirements listed
- ✅ Implementation checklist created

### GREEN Phase (DEV Team - Next Steps)
1. Pick one failing test from implementation checklist.
2. Implement minimal code to make it pass.
3. Run test to verify green.
4. Move to next test.

### REFACTOR Phase
1. Verify all tests pass.
2. Review for code quality (DRY, naming, performance).
3. Ensure animations are smooth and follow "Emotional" layer vibe.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)
**Command:** `npx playwright test tests/e2e/wedding-homepage-packages.spec.ts`

**Results:**
```
  8) [firefox] › tests/e2e/wedding-homepage-packages.spec.ts:10:7 › Wedding Homepage Sections › should render Packages Section with 3 distinct tiers 
    TimeoutError: locator.scrollIntoViewIfNeeded: Timeout 15000ms exceeded.
    Call log:
      - waiting for getByTestId('packages-section')
```

**Summary:**
- Total tests: 12 (3 browsers x 4 tests)
- Passing: 0
- Failing: 12
- Status: ✅ RED phase verified

---

**Generated by BMad TEA Agent** - 2026-02-05
