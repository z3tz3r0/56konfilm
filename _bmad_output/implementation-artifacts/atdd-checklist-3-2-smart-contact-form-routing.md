# ATDD Checklist - Epic 3, Story 3.2: Smart Contact Form Routing

**Date:** 2026-02-04
**Author:** Z3tz3r0
**Primary Test Level:** E2E

---

## Story Summary

As a **Business Owner**, I want **commercial and wedding inquiries to be distinct**, so that **my team responds faster**.
The contact form adapts its fields and header based on the current Site Mode (Commercial vs. Wedding).

---

## Acceptance Criteria

1. **Commercial Mode:** Header says "Commercial Inquiry", type is "commercial".
2. **Wedding Mode:** Header says "Tell us your love story", includes "Wedding Date" & "Venue", type is "wedding".
3. **Routing:** Submission routes data to correct handler.
4. **Transition:** Smooth animation when switching modes on the page.

---

## Failing Tests Created (RED Phase)

### E2E Tests (3 tests)

**File:** `tests/e2e/contact-form-routing.spec.ts` (72 lines)

- ✅ **Test:** Commercial Mode: should display standard inquiry form
  - **Status:** RED - Element not found (`heading` "Commercial Inquiry", `getByTestId` inputs)
  - **Verifies:** Default commercial form state (hidden wedding fields).

- ✅ **Test:** Wedding Mode: should display love story form with extra fields
  - **Status:** RED - Element not found (`heading` "Tell us your love story", `wedding-date-input`)
  - **Verifies:** Wedding specific fields and header.

- ✅ **Test:** Mode Switching: should transition form content smoothly
  - **Status:** RED - Element not found (or menu interaction required)
  - **Verifies:** Dynamic state change without page reload using Target-First strategy (robust for mobile).

---

## Data Factories Created

### ContactSubmission Factory

**File:** `tests/support/factories/contact.factory.ts`

**Exports:**
- `createContactSubmission(overrides?)`
- `createContactSubmissions(count)`

**Example:**
```typescript
const data = createContactSubmission({ type: 'wedding' });
```

---

## Fixtures & Infrastructure

- **setMode:** Utilizes existing `setMode` fixture in `tests/support/fixtures/index.ts`.
- **Mocking:** `page.route('/api/contact')` used in test `beforeEach` to mock backend.

---

## Required data-testid Attributes

### Contact Form Component

- `name-input` - Name field
- `email-input` - Email field
- `message-input` - Message textarea
- `wedding-date-input` - Date picket (Wedding only)
- `venue-input` - Venue text input (Wedding only)
- `submit-button` - Submit button
- `mode-switcher` - (Existing) Mode toggle button

---

## Implementation Checklist

### Test: Commercial Mode & Basic Structure

**File:** `tests/e2e/contact-form-routing.spec.ts`

**Tasks:**
- [ ] Create `src/app/[lang]/contact/page.tsx`
- [ ] Create `src/components/features/contact/ContactForm.tsx`
- [ ] Implement Zod schema for validation
- [ ] Add `data-testid` attributes to inputs
- [ ] Run test: `npm run test:e2e -- contact-form-routing.spec.ts`
- [ ] ✅ Test passes

### Test: Wedding Mode & Conditional Fields

**Tasks:**
- [ ] Implement `useMode` hook integration
- [ ] Add conditional rendering for "Wedding Date" and "Venue"
- [ ] Update header text based on mode
- [ ] Run test: `npm run test:e2e -- contact-form-routing.spec.ts`
- [ ] ✅ Test passes

### Test: Transitions

**Tasks:**
- [ ] Wrap conditional fields in `AnimatePresence` + `motion.div`
- [ ] Ensure `layout` prop is used for smooth resizing
- [ ] **Mobile Support:** ModeSwitcher interaction must handle mobile menu state (Target-First)
- [ ] Run test: `npm run test:e2e -- contact-form-routing.spec.ts`
- [ ] ✅ Test passes

**Estimated Effort:** 4 hours

---

## Running Tests

```bash
# Run all failing tests
npm run test:e2e -- contact-form-routing.spec.ts

# Debug
npm run test:e2e -- contact-form-routing.spec.ts --debug
```

---

## Knowledge Base References Applied

- **fixture-architecture.md:** Used `test.beforeEach` for route interception.
- **data-factories.md:** Used `faker` for contact data.
- **network-first.md:** Intercepted `/api/contact` before navigation.
- **test-levels-framework.md:** Chosen E2E for UI-heavy logic.
