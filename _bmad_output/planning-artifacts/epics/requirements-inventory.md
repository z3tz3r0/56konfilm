# Requirements Inventory

## Functional Requirements

**Core Experience & Modes:**
*   **FR-1 [Implemented]:** Visitor can toggle "Commercial/Wedding" modes via global **Mode Switcher**.
*   **FR-2 [Implemented]:** System persists **Mode Preference** (Persistent Storage/Cookies) across sessions.
*   **FR-4 [Implemented]:** System handles **Seamless Page Transitions** (no white flash) between pages and modes.
*   **FR-5 [Implemented]:** Content grids and Navigation filter and style automatically based on **Active Mode**.
*   **FR-11 [New]:** Homepage features **Full-screen Showreel Loop** with "Brutal" Scroll-driven Typography (e.g., "WE SHOOT HARD") in Commercial Mode.

**Navigation & Discovery:**
*   **FR-3 [Pending Implementation]:** Visitor experiences **Smooth Scroll (Scrubbing)** interaction. (Metric: Input latency < 16ms / 60fps).
*   **FR-7 [Pending Verification]:** Visitor navigates via **Dynamic Routing** (`/works/[slug]` vs `/stories/[slug]`).
*   **FR-12 [New]:** **Contact Form** adapts destination, fields, and labels based on Active Mode ("Commercial Inquiry" vs "Love Story").

**Content Presentation:**
*   **FR-6 [Modified]:** Work Detail pages display video using **Hybrid Strategy**: Optimized MP4 for Loops, HLS/Vimeo/Mux for Long-form.
*   **FR-13 [New]:** Work Detail pages support **Magazine-Style Layouts** (not just grids), managed via CMS blocks.
*   **FR-15 [New]:** About usage of **Dual-Context Content** (different text/images for Commercial vs Wedding on the same route).

**CMS & Administration:**
*   **FR-8 [Implemented]:** Admin allows creation of pages via **Modular Page Builder** (Drag & Drop blocks).
*   **FR-9 [Implemented]:** Admin manages **Bilingual Content** (TH/EN) via CMS Native Localization (`internationalized-array`).
*   **FR-10 [Implemented]:** Admin manages **Projects** and **Pages** as distinct types.
*   **FR-14 [New]:** CMS Input allows **Drag-and-Drop** of multiple clips for rapid gallery creation (Operational Efficiency).

## NonFunctional Requirements

**Performance & Motion:**
*   **NFR-1 (Load Time):** LCP **< 2.5s** on 4G Mobile; TBT **< 200ms**.
*   **NFR-2 (Smoothness):** Animation/Scroll must run at **60fps (Stable)**. **0 frames dropped** during Mode Transitions.
*   **NFR-3 (Transition):** Visual delay **<= 300ms**; CLS < 0.1.
*   **NFR-10 [New] (Device Tiering):** Motion degrades gracefully on low-end hardware (disable heavy parallax/blur).

**SEO & Discovery:**
*   **NFR-4 (Indexability):** 100% of Landing Pages use **SEO-friendly pre-rendering (ISR/SSR)**.
*   **NFR-5 (Structured Data):** Valid `VideoObject` schema on Detail pages.
*   **NFR-7 [New] (Bilingual SEO):** Implement `hreflang` / `alternate` tags for TH/EN indexing.
*   **NFR-11 [New] (Technical SEO):** Dynamic `sitemap.xml` and `robots.txt` differentiating Production vs Staging.

**Architecture & Quality:**
*   **NFR-6 (Standard Video):** Use native HTML5 for loops; External streaming (HLS) for long-form.
*   **NFR-9 [New] (CMS Safety):** "No-Code Sanctity" - Validations prevent user error (e.g., warn on small images), no raw code injection.

## Additional Requirements

**From Architecture:**
*   **Starter Template:** High-Performance Next.js 16 Boilerplate (Next.js 16.1, React 19.2, Tailwind 4, Motion 12.29, Sanity v5.6).
*   **Core Tech Stack:** ModeProvider (Cookies/LocalStorage), Zustand 5, Sanity v4 (siteMode, i18n-array).
*   **Rendering Strategy:** ISR (60s revalidation) for Marketing pages; Webhook On-demand revalidation for Works.
*   **Implementation Pattern:** "Unstyled First" Radix UI primitives with mode-specific Tailwind variables.

**From UX & Design Assets:**
*   **Cinematic Dualism:** Strict separation of Production (Commercial) and Wedding (Studio) modes.
*   **Page Coverage (Production):** Landing, Portfolio, Services, Contact Us.
*   **Page Coverage (Wedding):** Landing, Portfolio, Services, Packages, About Us/BTS, Contact Us.
*   **Responsive Compliance:** Mobile (375px+), Tablet (768px+), Desktop (1280px+), Ultrawide (1920px+).
*   **Component Strategy:** Prioritize existing `shadcn/ui` components, customizing only for "Cinematic" gaps.

## FR Coverage Map

*   **FR-1 (Mode Switcher):** Epic 1 (Core Logic) & Epic 3 (UI/Experience Refinement).
*   **FR-2 (Persistence):** Epic 1 (Core Implementation).
*   **FR-3 (Smooth Scroll):** Epic 1 (Foundation) & Epic 2 (Detail Scrubbing).
*   **FR-4 (Transitions):** Epic 1 (Global System).
*   **FR-5 (Content Filtering):** Epic 1 (Logic) & Epic 3 (Wedding Context).
*   **FR-6 (Hybrid Video):** Epic 2 (Detail Experience) & Epic 4 (Optimization).
*   **FR-7 (Dynamic Routing):** Epic 2 (Core Routing).
*   **FR-8 (Page Builder):** Epic 4 (Admin Experience Refinement).
*   **FR-9 (Bilingual):** Epic 1 (Foundation) & Epic 4 (Input Refinement).
*   **FR-10 (Project Types):** Epic 3 (Wedding Types) & Epic 4 (Admin Management).
*   **FR-11 (Showreel Loop):** Epic 1 (Commercial Home).
*   **FR-12 (Smart Contact):** Epic 3 (Conversion Logic).
*   **FR-13 (Mag Layouts):** Epic 2 (Detail Experience).
*   **FR-14 (Drag-Drop):** Epic 2 (Implementation) & Epic 4 (Refinement).
*   **FR-15 (Dual-Context):** Epic 2 (Structure) & Epic 3 (Content).
