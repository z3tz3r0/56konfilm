# Story 2.3: Project Navigation & Cinematic Transitions

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Visitor**,
I want **to intuitively browse to the next project at the bottom of the page**,
so that **I keep consuming content without hitting a dead end.**

### 1. Introduction
Users currently hit a dead end after viewing a project. We need to implement a "Next Project" navigation card that keeps them in the "flow". Crucially, this navigation must respect the Dual-Identity nature (Commercial flows to Commercial, Wedding to Wedding) and trigger our signature `CurtainWipe` transition.

## Acceptance Criteria

1. **Given** I am viewing a Project Detail page for a "Commercial" project
   **When** I scroll to the bottom
   **Then** I should see a "Next Project" card.
   **And** the next project MUST be from the "Commercial" (Production) set.

2. **Given** I am viewing a "Wedding" project
   **When** I scroll to the bottom
   **Then** I should see a "Next Project" card linking to the next "Wedding" project.

3. **Given** I click "Next Project"
   **When** the navigation begins
   **Then** the Global `CurtainWipe` transition must trigger:
     - Curtain covers the screen.
     - Page navigation occurs.
     - Curtain lifts on the new page.
   **And** the `mode` must NOT change (persisted via cookie/state).

4. **Given** I am on the last project of the list
   **Then** the "Next Project" should loop back to the first project of the same mode (Circular list).

## Technical Requirements

### 1. Development Context

- **Files to Modify/Create:**
  - `src/components/page/ProjectNavigation.tsx` (New Component)
  - `src/app/[lang]/work/[slug]/page.tsx` (Integrate the component)
  - `src/sanity/lib/queries.ts` (Update `PROJECT_DETAIL_QUERY` to fetch `nextProject`)
  - `src/types/sanity.ts` (Update Project type)
  - `src/stores/useTransitionStore.ts` (Ensure `isTransitioning` / `isCovered` are available)

### 2. Architecture Guidelines

- **Data Fetching (Atomic GROQ):**
  - **Constraint:** Do NOT fetch the entire next project object. Fetch minimal data: `title`, `slug`, `mainImage`, `client`, `year`.
  - **Query Pattern:** Use GROQ's `order()` and logical index finding, or simply fetch neighbors.
    - *Simpler Approach:* Fetch basic list of *all* project slugs/IDs in current mode, find current index, determine next index (with wrap-around) in the application layer or efficient projection.
    - *Better Performance:* Use GROQ specialized neighbor query:
      ```groq
      "nextProject": *[_type == "project" && $siteMode in siteMode && _createdAt > ^._createdAt] | order(_createdAt asc) [0] {
         title, "slug": slug.current, ...
      }
      // Fallback to first if null (Loop)
      ```
- **Visual Transition Orchestration:**
  - **Strict Separation:** The `ProjectNavigation` component must acts as a **Trigger**.
  - **Robustness:** Use the "Safety Lock" pattern (see `visual-transition-orchestration` skill).
    - Set `isTransitioning(true)`.
    - Wait for `isCovered` state from the Global Transition component.
    - ONLY THEN trigger `router.push()`.

### 3. Library / Framework Requirements

- **Routing:** Use `next/navigation` (`useRouter`) for imperative navigation after the transition curtain is closed.
- **State:** `zustand` for `useTransitionStore`.
- **Styling:** Tailwind CSS 4.

### 4. Testing Requirements

- **E2E (Playwright):**
  - **Test ID:** `data-testid="project-navigation"`
  - **Transition Test:**
    - Click next project.
    - *Assert:* `data-testid="curtain"` becomes visible.
    - *Assert:* URL changes.
    - *Assert:* `data-testid="curtain"` becomes hidden.
  - **Data Isolation:** Verify that a Commercial project NEVER links to a Wedding project.

## Implementation Tips

- **Transition Timing:** Do NOT rely on `setTimeout`. Rely on the `isCovered` state signal from the transition component.
- **GROQ Logic:** Filtering by `siteMode` is critical. `siteMode` is an array of strings (`['production', 'wedding']`). Ensure your neighbor query matches the *current* page's context.

## Tasks / Subtasks

- [ ] **1. Data Layer (Sanity)**
  - [ ] Update `PROJECT_DETAIL_QUERY` in `src/sanity/lib/queries.ts` to fetch `nextProject` (Title, Slug, Image).
  - [ ] Implement circular logic (if next is null, fetch first).
  - [ ] Update `src/types/sanity.ts`.
- [ ] **2. Component Implementation**
  - [ ] Create `ProjectNavigation.tsx`.
  - [ ] Implement Layout (Design assets: Large Card, Title, "Next Project" label).
  - [ ] Integrate `useTransitionStore` for the click handler.
- [ ] **3. Integration**
  - [ ] Add to `src/app/[lang]/work/[slug]/page.tsx`.
- [ ] **4. Testing**
  - [ ] Playwright test for navigation flow and transition masking.

## Dev Notes

- **Ref:** See `_bmad_output/planning-artifacts/epics/epic-2-the-cinematic-showcase-work-detail-experience.md`
- **Pattern:** `visual-transition-orchestration` skill guidelines are MANDATORY.
- **Project Structure:** Component belongs in `src/components/page/` or `src/components/work/`. Given it's specific to Project Page, `src/components/page/project/` is ideal if it exists, otherwise `src/components/page/`.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### File List
- src/sanity/lib/queries.ts
- src/types/sanity.ts
- src/components/page/ProjectNavigation.tsx
- src/app/[lang]/work/[slug]/page.tsx
- tests/e2e/project-navigation.spec.ts
