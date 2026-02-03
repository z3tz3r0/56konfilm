# ATDD Checklist: Story 2.3 Project Navigation & Cinematic Transitions

**Story**: 2.3
**Primary Test Level**: E2E
**User**: Z3tz3r0

## Acceptance Criteria & Test Mapping

### AC1 & AC2: Navigation Card Presence & Mode Logic
- **Test File**: `tests/e2e/project-navigation.spec.ts`
- **Test Case**: `should navigate to next project with curtain transition`
- **Description**: Verifies that when on a project page, the "Next Project" card appears.

### AC3: Cinematic Transition (Curtain Wipe)
- **Test File**: `tests/e2e/project-navigation.spec.ts`
- **Test Case**: `should navigate to next project with curtain transition`
- **Description**: Verifies that clicking the card triggers the Global Curtain (covering screen), changes URL, and then lifts.

## Mock Requirements (Critical for Dev)

Since this project uses "Backdoor Mocking" in `getE2eMockProject` located in `src/app/[lang]/work/[slug]/page.tsx`, you **MUST** add the following mock data:

**1. `e2e-project-nav-start`**
- Should emulate a **Commercial** project.
- **MUST** have a `nextProject` field (or the queries handling it must resolve it).
- Expected Result: "Next Project" points to `e2e-project-nav-next`.

**2. `e2e-project-nav-next`**
- A simple dummy project to function as the destination.

## Required data-testid Attributes

Please ensure the following IDs are present in the DOM:

- `project-navigation`: The container/card for the Next Project link.
- `global-transition-curtain`: The actual AnimatePresence curtain element (from Story 1.2).
- `project-title`: The H1 of the project detail page (for wait stability).

## Implementation Checklist

### Sanity & Data Layer
- [ ] **Update Queries**: Modify `PROJECT_DETAIL_QUERY` (or `fetchProject`) to retrieve the `nextProject` (slug, title, image).
- [ ] **Update Types**: Add `nextProject` to the `Project` interface in `src/types/sanity.ts`.
- [ ] **Implement Logic**: Ensure `nextProject` logic respects `siteMode` (Production -> Production, Wedding -> Wedding) and loops (Circular).

### Components & UI
- [ ] **ProjectNavigation Component**: Create `src/components/page/ProjectNavigation.tsx`.
- [ ] **Visual Transition**: Hook up `useTransitionStore`. Ensure clicking the link triggers `setIsTransitioning(true)` and waits for `isCovered` before pushing the route.
- [ ] **Page Integration**: Add `<ProjectNavigation />` to `src/app/[lang]/work/[slug]/page.tsx`.

### Testing Infrastructure
- [ ] **Mock Data**: Update `getE2eMockProject` in `page.tsx` to return the `nextProject` mock data for the E2E specific slugs.

## Red-Green-Refactor Cycle

**RED Phase** (Complete):
- [x] Failing E2E test created (`tests/e2e/project-navigation.spec.ts`).

**GREEN Phase** (Your Turn):
1. Run `npm run test:e2e -- project-navigation`
2. Observer failure (404 or missing element).
3. Implement the Mocks in `page.tsx` -> Re-run test (Should fail on missing UI).
4. Implement Component & Logic -> Re-run test (Should pass).

**REFACTOR Phase**:
- Optimize the GROQ query for "Next Project" to be efficient (single query vs separate fetch).
