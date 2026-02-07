# ATDD Checklist - Epic 4, Story 3: CMS Validation & Safeguards (No-Code Sanctity)

**Date:** 2026-02-07
**Author:** Z3tz3r0
**Primary Test Level:** E2E (Sanity Studio)

---

## Story Summary

Refine the Sanity Studio experience to be strictly "No-Code" and user-friendly for the owner by implementing safeguards and validation rules.

**As a** Business Owner
**I want** the CMS to warn me if I upload a bad image or forget a field
**So that** I don't accidentally break the design of my own website.

---

## Acceptance Criteria

1. **Given** I am editing a "Hero Section"  
   **When** I try to upload a 5MB image  
   **Then** Sanity should show a Warning: "Image too large, please optimize < 1MB".

2. **Given** I try to publish a Project without a Slug or Title  
   **When** I click "Publish"  
   **Then** Sanity should Block the publish action with a Validation Error.

3. **Given** I look for "HTML Embed" fields in any schema type  
   **When** I am in the Studio  
   **Then** I should NOT find any (to prevent breaking the layout).

---

## Failing Tests Created (RED Phase)

### E2E Tests (3 tests)

**File:** `tests/e2e/sanity/validation.spec.ts` (~110 lines)

- ✅ **Test:** AC 2: should block publishing a Project when required fields are missing
  - **Status:** RED - Timeout (expected UI element `text=/Title is required/i` not found)
  - **Verifies:** That `title` and `slug` fields carry `Rule.required().error()` and block the publish button.

- ✅ **Test:** AC 1: should show a warning when an image exceeds 1MB in Hero Section
  - **Status:** RED - Timeout (expected warning text not found)
  - **Verifies:** That large image assets trigger a non-blocking `warning()` using `Rule.custom`.

- ✅ **Test:** AC 3: should NOT contain any HTML Embed or Code fields in schemas
  - **Status:** RED - Timeout or assertion failure
  - **Verifies:** That no destructive code-injection fields are available in the page builder list.

---

## Data Factories Created

No new factories created for this story, but `createProject` from `tests/support/factories/project.factory.ts` is utilized for context.

---

## Fixtures Created

### Sanity Auth Mock
The tests use a `beforeEach` block to navigate to `/sanity-cms/login`, intercept the login API, and set a mock session cookie.

---

## Mock Requirements

### Sanity Asset Check Mock
**Endpoint:** `**/data/query/**` (GROQ Query)
**Success Response:** Simulated image metadata with `size: 50 * 1024 * 1024` to trigger validation.

---

## Required data-testid Attributes

### Sanity Studio Selectors (Standard & Custom)
- `pane` - Studio sidebars and content panes
- `pane-item` - Navigation items
- `add-button` - The (+) button to create new documents/items
- `publish-button` - The main action button in Studio
- `email-input`, `password-input` (on login page)

---

## Implementation Checklist

### Test: AC 2: Project Required Fields
**File:** `tests/e2e/sanity/validation.spec.ts`
**Tasks to make this test pass:**
- [ ] Update `src/sanity/schemaTypes/projects.ts`
- [ ] Add `.validation(Rule => Rule.required().error('Title is required'))` to `title`.
- [ ] Add `.validation(Rule => Rule.required().error('Slug is required'))` to `slug`.
- [ ] Run test: `npx playwright test tests/e2e/sanity/validation.spec.ts -g "AC 2"`
- [ ] ✅ Test passes (green phase)

### Test: AC 1: Image Size Warning
**File:** `tests/e2e/sanity/validation.spec.ts`
**Tasks to make this test pass:**
- [ ] Update `src/sanity/schemaTypes/objects/backgroundMedia.ts`
- [ ] Implement `Rule.custom()` for image size using `context.getClient`.
- [ ] Return `.warning('Image too large, please optimize < 1MB')` for assets > 1MB.
- [ ] Run test: `npx playwright test tests/e2e/sanity/validation.spec.ts -g "AC 1"`
- [ ] ✅ Test passes (green phase)

### Test: AC 3: No HTML Embed
**File:** `tests/e2e/sanity/validation.spec.ts`
**Tasks to make this test pass:**
- [ ] Verify all sections in `src/sanity/schemaTypes/sections/` do not contain `code` or `html` field types.
- [ ] Ensure `contentBlocks` in `projects.ts` does not include legacy embed types.
- [ ] Run test: `npx playwright test tests/e2e/sanity/validation.spec.ts -g "AC 3"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

## Running Tests

```bash
# Run all failing tests for this story
npx playwright test tests/e2e/sanity/validation.spec.ts

# Run specific test file
npx playwright test tests/e2e/sanity/validation.spec.ts --reporter=list

# Run tests in headed mode (see browser)
npx playwright test tests/e2e/sanity/validation.spec.ts --headed

# Debug specific test
npx playwright test tests/e2e/sanity/validation.spec.ts --debug
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅
The TEA Agent has verified that all tests fail initially as the implementation for story 4.3 is not yet present.

### GREEN Phase (DEV Team - Next Steps)
1. Pick one failing test (Recommendation: AC 2 first).
2. Implement minimal Sanity validation rules.
3. Run the targeted test to verify green.
4. Repeat for image size warning and schema sanitization.

---

## Knowledge Base References Applied
- **fixture-architecture.md** - Applied for mocking auth and Studio environment.
- **network-first.md** - Intercepting GROQ queries to simulate large assets.
- **test-quality.md** - Atomic tests following Given-When-Then.

---

## Test Execution Evidence
All 3 tests failed in Chrome and Firefox as expected.

---

**Generated by BMad TEA Agent** - 2026-02-07
