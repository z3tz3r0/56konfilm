# Story 2.0: Media Gallery Refinement Plan

**Goal:** Fix layout alignment/responsiveness issues and elevate the "Media Gallery" to a premium standard using `motion/react` and better grid composition.

## 1. Issues Identified
-   **Alignment:** The `header` block uses `items-center` (via `alignClass`) but might lack `mx-auto` to center the container itself within the `SectionShell`.
-   **Grid gaps:** Default CSS Grid aligns to start. If there are 2 items in a 3-col grid, it looks lopsided.
-   **Responsiveness:** `aspect-4/3` is rigid. Mobile might benefit from slightly different sizing or horizontal scrolling if requested (but column stack is safer).

## 2. Proposed Changes
**File:** `src/components/page/sections/MediaGallerySection.tsx`

### A. Layout & Alignment
-   **Header:** explicitly apply `mx-auto` when `block.heading?.align` is 'center'.
-   **Grid:**
    -   Use `justify-center` for the grid container to handle cases with dragging items (optional, but standard grid is usually better for strict galleries).
    -   Stick to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` but ensure `gap` shrinks on mobile.

### B. "Premium" Upgrade (Frontend-Design Skill)
-   **Motion:** Implement `<motion.div>` with `staggerChildren` for the grid items.
    -   Check `TimelineSection` for existing Motion patterns.
-   **Hover:** Enhance the hover state.
    -   Current: Scale 1.05.
    -   New: Add a subtle shadow increase or gloss effect.
-   **Typography:** Ensure captions (`figcaption`) are styled elegantly (e.g., small caps, muted foreground, maybe hidden until hover on desktop?). *Decision: Keep visible for usability, but style it.*

## 3. Verification
-   **Manual:**
    -   Check 1, 2, 3, and 4 item configurations.
    -   Resize window from Mobile -> Tablet -> Desktop.
    -   Verify "Center" alignment option effectively centers the text block.
-   **Lint:** Ensure no ESLint errors (except the known circular one).
