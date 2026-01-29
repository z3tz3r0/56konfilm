# Project Structure & Boundaries

## Complete Project Directory Structure
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

## Architectural Boundaries
- **Mode Boundary:** Persisted in Cookies (Server) and synchronized with `ModeProvider` (Client). All styling is driven by global CSS Variables derived from this state.
- **Data Boundary:** Sanity is the Single Source of Truth. Data flows from RSCs down to client components via Props.
- **Animation Boundary:** Unified timing and easing constants in `src/components/ui/transitions/`.

## Requirements to Structure Mapping
- **Dual-Mode Logic:** `Middleware` + `ModeProvider` + `Layout`.
- **Modular Page Builder:** `SectionRenderer` in `[slug]/page.tsx`.
- **Cinematic Experience:** Framer Motion orchestration in `src/components/ui/`.
- **Bilingual Support:** `LOCALIZED` fragment in `src/sanity/lib/queries/`.
