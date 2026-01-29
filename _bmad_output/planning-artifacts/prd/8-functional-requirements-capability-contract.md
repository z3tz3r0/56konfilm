# 8. Functional Requirements (Capability Contract)

## Dual-Identity & Interaction
*   **FR-1 [Implemented]:** Visitor can toggle "Commercial/Wedding" modes via global **Mode Switcher**.
*   **FR-2 [Implemented]:** System persists **Mode Preference** (Cookie/LocalStorage) across sessions.
*   **FR-3 [Pending Implementation]:** Visitor experiences **Smooth Scroll (Scrubbing)** interaction. (Action: Implement `Lenis` in `layout.tsx`)
*   **FR-4 [Implemented]:** System handles **Seamless Page Transitions** (no white flash).

## Content Consumption
*   **FR-5 [Implemented]:** Content grids filter automatically based on **Active Mode**.
*   **FR-6 [Modified]:** Work Detail pages display video using **Native HTML5 Video** (Standard `<video>` tag for performance/simplicity).
*   **FR-7 [Pending Verification]:** Visitor navigates via **Dynamic Routing** (`/works/[slug]` vs `/stories/[slug]`).

## Content Management (Admin)
*   **FR-8 [Implemented]:** Admin allows creation of pages via **Modular Page Builder**.
*   **FR-9 [Implemented]:** Admin manages **Bilingual Content** (TH/EN) via Sanity `internationalizedArray`.
*   **FR-10 [Implemented]:** Admin manages **Projects** and **Pages** as distinct types.
