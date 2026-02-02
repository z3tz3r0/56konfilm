---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-01-29T20:34:00+07:00'
inputDocuments:
  - _bmad_output/planning-artifacts/product-brief-56konfilm-2026-01-27.md
  - _bmad_output/planning-artifacts/prd/index.md
  - _bmad_output/planning-artifacts/ux-design-specification/index.md
  - _bmad_output/planning-artifacts/design-assets/index.md
  - docs/brownfield-architecture.md
  - docs/coding-standards.md
project_name: '56konfilm'
user_name: 'Z3tz3r0'
date: '2026-01-29T18:13:45+07:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The system is built as a **Dual-Identity Platform** (Commercial Production vs. Wedding Studio). Key architectural drivers include a **Global Mode Switcher** with persistent state (cookies), a **Modular Page Builder** powered by Sanity v4, and native **Bilingual support (TH/EN)**. Higher complexity interactions involve **Smooth Scroll (Scrubbing)** at 60fps and **Seamless Page Transitions** to maintain a premium cinematic feel.

**Non-Functional Requirements:**
Strict performance targets are set: **LCP < 2.5s** on 4G Mobile, and stable **60fps animations** for all scrolling and transitions. SEO is prioritized with **100% pre-rendering** for landing pages and **VideoObject structured data**. Video playback must utilize **Standard Compliant Video Playback** to minimize bundle size while maintaining performance.

**Scale & Complexity:**
- **Primary domain:** Full-stack Responsive Web (Next.js 16+, React 19)
- **Complexity level:** High (due to dual-mode logic synchronization and high-performance animation requirements)
- **Estimated architectural components:** 25-35 (including Sections, UI Primitives, and shared Layout logic)

### Technical Constraints & Dependencies
- **Core Stack:** Next.js 16.0.7 (App Router), React 19.2.1, Tailwind CSS 4, Sanity v4, Motion (Framer Motion).
- **Data Persistence:** Use of Browser cookies for Mode persistence to enable Middleware-level logic.
- **Localization:** Thai as primary locale, extended by `sanity-plugin-internationalized-array` for English.
- **Design Parity:** Must strictly adhere to high-frame design assets (R01_*.png) across both modes.

### Cross-Cutting Concerns Identified
- **Dual-Mode State Management:** Synchronizing the 'Production' vs 'Wedding' state across Middleware, Theme (Dark/Light), and CMS Query contexts.
- **Performance Budgeting:** Maintaining a 60fps frame rate while rendering rich media and animations.
- **Schema & Type Integrity:** Enforcing strict parity between Sanity Schemas, TypeScript interfaces, and GROQ query selectors.
- **Enterprise-ready Video Handling:** Optimized loading and playback strategies for high-quality production showreels.

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack Responsive Web (Cinema-Grade Marketing Page)**
Based on the identified stack, this project utilizes a custom-architected foundation optimized for Vercel and Sanity CMS.

### Selected Foundation: High-Performance Next.js 16 Boilerplate

**Rationale for Selection:**
The project is already established on a modern, production-ready stack that aligns with 2026 best practices. It leverages **Next.js 16's stable Turbopack** for speed, **React 19.2** for cutting-edge UI features, and **Tailwind 4's Oxide engine** for minimal CSS footprint. This foundation is perfectly tailored for **Vercel's global edge network**, ensuring the high-performance NFRs (LCP < 2.5s) are achievable.

**Initialization Context:**
- **Provider:** Vercel (Edge-first deployment)
- **Build Tooling:** Turbopack (Default in Next.js 16)
- **Runtime:** Node.js 20+

### Architectural Decisions Provided by Foundation

**Language & Runtime:**
- **Next.js 16.0.7 & React 19.2.1:** Utilizing the App Router with Stable Cache Components (`"use cache"` directive) for optimal static/dynamic hybrid rendering.
- **TypeScript 5:** Strict type checking enforced, especially for CMS content mapping.

**Styling & Design System:**
- **Tailwind CSS 4:** CSS-first configuration using `@theme` rules. No `tailwind.config.js` required, leveraging the Oxide engine for lightning-fast builds.
- **Radix UI Primitives:** Accessible, unstyled components providing a solid structural base for custom cinematic UI.

**Animation & Smoothness (The "60fps" Pillar):**
- **Motion (formerly Framer Motion) 12.23+:** Utilizing the hybrid engine to achieve 120fps/60fps stable animations. Focus on Scroll-driven animations and View Transitions.

**CMS & Content:**
- **Sanity v4:** Modular Page Builder approach with native localization.
- **`next-sanity` 11+:** Optimized GROQ fetching with tag-based revalidation (`updateTag()`).

**Development Experience:**
- **Turbopack:** 2-10x faster HMR and build times compared to Webpack.
- **ESLint 9 & Prettier:** Production code quality standards.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1.  **Dual-Mode Orchestration:** Global `ModeProvider` controlled via **Cookies** (for Server/Middleware) and synced with `localStorage`.
2.  **State Management:** **Zustand 5.0** for global UI state and Mode toggle synchronization.
3.  **Content Architecture:** **Sanity v4** as the single source of truth, utilizing `siteMode` field for document separation and `internationalized-array` for TH/EN localization.

**Important Decisions (Shape Architecture):**
1.  **Media Strategy:** **Native HTML5 Video** (Muted Loop) for grids, optimized for performance without external heavy players.
2.  **Animation Framework:** **Motion (Framer Motion) 12.23+** as the core engine for transitions like `CurtainWipe` and `MagneticButton`.
3.  **UI Library:** **Radix UI** primitives (via shadcn/ui) stripped of default styles to use mode-specific Tailwind 4 variables.

**Deferred Decisions (Post-MVP):**
1.  **Advanced User Auth:** Deferred; focus on portfolio/marketing content.
2.  **External Database:** Sanity handles primary data; Vercel Postgres considered only for future complex lead/management needs.

### Data Architecture
- **Source:** Sanity v4.
- **Modeling:** Document-level mode separation (`production` | `wedding`). Shared block structures with dynamic styling context.
- **Caching:** Next.js **Stable Cache Components (`"use cache"`)** + Tag-based revalidation via `next-sanity`.

### Authentication & Security
- **Auth:** Not required for MVP.
- **Access Control:** Sanity Studio RBAC for content editors.

### API & Communication Patterns
- **Fetching:** Direct GROQ queries in React Server Components.
- **Media Delivery:** Standard MP4/WebM with lazy-loading and IntersectionObserver-triggered autoplay.

### Frontend Architecture
- **Performance:** Native Motion-based scrolling and scrubbing (targeting 60fps).
- **Styling Strategy:** "Unstyled First" - Components read from `ModeProvider` to apply Tailwind 4 CSS Variables (e.g., matching Sora for Production and Cormorant for Wedding).
- **Transition Orchestration:** `AnimatePresence` for the global `CurtainWipe` between mode changes.

### Infrastructure & Deployment
- **Hosting:** Vercel (Edge-optimized).
- **CI/CD:** Vercel Git integration with Preview deployments for schema validation.

## Implementation Patterns & Consistency Rules

### Naming Patterns
- **Components:** `PascalCase` (e.g., `VideoGridItem.tsx`).
- **Hooks:** `camelCase` starting with `use` (e.g., `useMode.ts`).
- **Sanity Fields:** `camelCase` (e.g., `siteMode`, `contentBlocks`).
- **CSS Variables:** `kebab-case` (e.g., `--primary-orange`, `--bg-wedding`).

### Dual-Mode Style Logic
1.  **Strictly Component-based:** Large layout `if/else` is forbidden. Use `ModeProvider` to toggle a global `[data-mode]` attribute.
2.  **CSS Variable Overrides:** Components must use Tailwind 4 variables defined in `globals.css` under mode-specific selectors (e.g., `@theme { --primary: #ff7b07; }` for production).
3.  **Typography Parity:** Automate font switching via CSS classes tied to the active mode.

### Atomic GROQ Composition (Data Fetching Pattern)
Queries are tiered to ensure performance and prevent context bloat:
1.  **Fragments** (`src/sanity/lib/queries/fragments.ts`): Reusable atoms like `LOCALIZED`, `IMAGE_PROJECTION`, `CTA_PROJECTION`.
2.  **Sections** (`src/sanity/lib/queries/sections.ts`): Module-level projections for each Content Block (e.g., `HERO_SECTION`).
3.  **Pages** (`src/sanity/lib/queries.ts`): The final assembly point in React Server Components where Fragments and Sections are composed into a single fetch.

### Enforcement Guidelines
- **AI Agents MUST** verify if a Fragment exists before writing new projection logic.
- **AI Agents MUST** update `src/types/sanity.ts` immediately after any query change.
- **No Over-fetching:** Explicit projections only; fetching entire objects (`*`) is forbidden.

## Project Structure & Boundaries

### Complete Project Directory Structure
```text
56konfilm/
├── sanity.config.ts            # Sanity Studio Root
├── src/
│   ├── app/                    # Next.js App Router (RSC-first)
│   │   ├── (site)/             # Group for main site pages
│   │   │   ├── [slug]/page.tsx # Modular Page Renderer
│   │   │   └── layout.tsx      # Global UI + ModeProvider
│   │   ├── api/                # Webhooks & Revalidation
│   │   └── globals.css         # Tailwind 4 Oxide Theme definitions
│   ├── components/
│   │   ├── providers/          # ModeProvider, ThemeProvider
│   │   ├── sections/           # Modular Page Blocks (Hero, VideoGrid, etc.)
│   │   ├── ui/                 # Accessible Primitives (Radix/Motion)
│   │   └── layout/             # Persistent Nav, Footer, ModeSwitcher
│   ├── hooks/                  # useMode, useIntersection, useLenis
│   ├── lib/                    # Shared utils (cn, constants)
│   ├── sanity/                 # Sanity Library
│   │   ├── lib/
│   │   │   ├── queries/        # Atomic Composition (Fragments, Sections)
│   │   │   └── client.ts       # Sanity Fetch Client with Caching
│   │   └── schemaTypes/        # Root for Sanity Schemas
│   ├── types/                  # Sanity.ts (Generated + Manual)
│   └── middleware.ts           # Cookie-based Mode Sync
└── docs/                       # Brownfield Documentation
```

### Architectural Boundaries
- **Mode Boundary:** Persisted in Cookies (Server) and synchronized with `ModeProvider` (Client). All styling is driven by global CSS Variables derived from this state.
- **Data Boundary:** Sanity is the Single Source of Truth. Data flows from RSCs down to client components via Props.
- **Animation Boundary:** Unified timing and easing constants in `src/components/ui/transitions/`.

### Requirements to Structure Mapping
- **Dual-Mode Logic:** `Middleware` + `ModeProvider` + `Layout`.
- **Modular Page Builder:** `SectionRenderer` in `[slug]/page.tsx`.
- **Cinematic Experience:** Framer Motion orchestration in `src/components/ui/`.
- **Bilingual Support:** `LOCALIZED` fragment in `src/sanity/lib/queries/`.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
The selected stack (Next.js 16, React 19, Tailwind 4, Sanity v4) represents a cutting-edge 2026 ecosystem. All technologies are compatible, with Next.js App Router serving as the perfect host for Sanity's RSC-optimized fetching logic.

**Pattern Consistency:**
The **Atomic GROQ Composition** pattern perfectly aligns with the project structure. By splitting queries into `fragments` and `sections`, we enforce modularity at the code level that mirrors the modularity of the Sanity Schema.

**Structure Alignment:**
The directory structure clearly delineates responsibilities, specifically separating `(site)` logic from `sanity` data logic, ensuring clean separation of concerns.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- **Dual-Identity:** Covered by `ModeProvider` and Cookie-based Middleware.
- **Page Builder:** Covered by dynamic `SectionRenderer` and modular Sanity schemas.
- **Bilingual:** Covered by the `LOCALIZED` helper and `internationalized-array` plugin support.

**Non-Functional Requirements Coverage:**
- **Performance (60fps/LCP):** Addressed by using Native Video, optimizing GROQ projections (no over-fetching), and utilizing Vercel's Edge network.
- **SEO:** Fully supported via Next.js Metadata API fed by Sanity data.

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical decisions regarding Data, UI, and State are made.
**Structure Completeness:** File paths are explicit (`src/sanity/lib/queries/`).
**Pattern Completeness:** Naming conventions and GROQ composition rules are strict and clear.

### Gap Analysis Results
- **Minor:** Specific Vercel Cache configuration headers for Sanity Webhooks could be documented further during implementation.
- **Minor:** Detailed interaction specs for complex animations (like `CurtainWipe` timing curves) will need to be refined in code.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed

**✅ Architectural Decisions**
- [x] Technology stack fully specified (Next.js 16, Sanity v4)
- [x] Dual-Mode architecture defined

**✅ Implementation Patterns**
- [x] Atomic GROQ Composition defined
- [x] Naming & Structure patterns established

**✅ Project Structure**
- [x] Complete directory tree generated
- [x] Dependencies mapped

### Architecture Readiness Assessment
**Overall Status:** READY FOR IMPLEMENTATION
**Confidence Level:** High
**Key Strengths:** Modular Data Architecture, Future-Proof Stack, Clean Boundary Separation.

### Implementation Handoff

**AI Agent Guidelines:**
- **Strictly adhere** to the Atomic GROQ pattern: Search `fragments.ts` first.
- **Verify types** immediately after touching queries.
- **Respect the Mode Boundary:** Don't hardcode colors; use CSS Variables.

**First Implementation Priority:**
Finish consolidating any remaining loose queries into the new `src/sanity/lib/queries/` structure.


