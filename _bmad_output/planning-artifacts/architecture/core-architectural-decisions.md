# Core Architectural Decisions

## Decision Priority Analysis

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

## Data Architecture
- **Source:** Sanity v4.
- **Modeling:** Document-level mode separation (`production` | `wedding`). Shared block structures with dynamic styling context.
- **Caching:** Next.js **Stable Cache Components (`"use cache"`)** + Tag-based revalidation via `next-sanity`.

## Authentication & Security
- **Auth:** Not required for MVP.
- **Access Control:** Sanity Studio RBAC for content editors.

## API & Communication Patterns
- **Fetching:** Direct GROQ queries in React Server Components.
- **Media Delivery:** Standard MP4/WebM with lazy-loading and IntersectionObserver-triggered autoplay.

## Frontend Architecture
- **Performance:** Native Motion-based scrolling and scrubbing (targeting 60fps).
- **Styling Strategy:** "Unstyled First" - Components read from `ModeProvider` to apply Tailwind 4 CSS Variables (e.g., matching Sora for Production and Cormorant for Wedding).
- **Transition Orchestration:** `AnimatePresence` for the global `CurtainWipe` between mode changes.

## Infrastructure & Deployment
- **Hosting:** Vercel (Edge-optimized).
- **CI/CD:** Vercel Git integration with Preview deployments for schema validation.
