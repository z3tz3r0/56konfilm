# 56KonFilm Brownfield Architecture Document

## Introduction
56KonFilm is a bilingual (Thai/English) marketing site for a production house offering full-spectrum production services and wedding photo/video coverage. The site is powered by Next.js 15 (App Router) with Sanity CMS for page composition and localization. This document captures the current reality of the codebase so new developers can safely extend it to match the provided high-frame designs.

## Current Business Objectives
- Showcase showreels, portfolios, services, and storytelling content for production and wedding audiences.
- Deliver a premium, professional visual experience with tasteful micro-interactions (no excessive animations).
- Keep all content and layout blocks managed in Sanity so non-developers can update the site.
- Maintain parity between the hi-fi mocks stored in `public/high-frame/*.png` and the implemented UI.

## Technology Stack Overview
- **Framework**: Next.js 16+ (App Router) with React 19.
- **Language**: TypeScript.
- **Styling**: Tailwind CSS 4 with custom utilities defined in `src/app/globals.css`.
- **CMS**: Sanity v4 with the `internationalized-array` plugin for localization.
- **Client Libraries**: `next-themes` for theming, `motion/react` for micro-interactions, `tailwind-merge` + `clsx` for class handling.
- **Tooling**: ESLint 9, Prettier + Tailwind plugin, npm scripts for dev/build/lint/format.

## Repository Layout Highlights
```
src/
  app/
    layout.tsx               // root HTML shell + font loading + ThemeProvider
    (site)/                  // public site routes
      page.tsx               // resolves first page by mode, redirects
      [slug]/page.tsx        // fetches Sanity page + renders via PageBuilder
    sanity-cms/[[...tool]]   // Sanity Studio mount (not shown above)
  components/
    navigation/              // Navbar + ModeSwitcher
    footer/                  // Footer component
    page/                    // PageBuilder + section components
    ui/                      // shared shadcn-like primitives (button, sheet, etc.)
  lib/                       // localization helpers, utility functions
  sanity/                    // Sanity client, queries, schemas, structure
  types/                     // TypeScript interfaces for Sanity data
public/
  high-frame/                // authoritative hi-fi mocks (R01_*.png)
```

## Request → Render Flow
1. `middleware.ts` inspects query params, cookies, and the `accept-language` header to determine `lang` and `mode`, persisting them as cookies.
2. `/[slug]` route calls `pageBySlugQuery` with locale + mode to obtain a `PageDocument`.
3. `PageBuilder` maps each `contentBlocks[]` entry to a React section component (Hero, TwoColumn, Timeline, etc.).
4. Section components rely on shared primitives (`SectionShell`, `CtaGroup`, `CtaButton`) and Tailwind classes for layout/styling.
5. Global settings (nav/footer content) should be fetched via `settingsQuery`—currently expected but not yet wired into the layout.

## Sanity Content Model
- **`settings` document**: stores localized site title, navigation items per mode, company info, contacts, and social links.
- **`page` document**: fields include `page` title, `siteMode` (production or wedding), `slug`, `contentBlocks` array of block types, optional `seoTitle`.
- **`project` document**: localized title/overview, `siteMode` array, `slug`, cover image, `publishedAt` (for portfolio grid).
- **`post` document**: localized title, slug, publish date, hero image, rich text body.
- **Object schemas**: localized strings/text, CTA definitions, background media, card/timeline/gallery/logo objects.

### Key GROQ Queries (`src/sanity/lib/queries.ts`)
- `settingsQuery`: localized nav/footer data.
- `projectsByModelQuery`: projects filtered by site mode.
- `pageBySlugQuery`: resolves localized fields for each block type, including nested CTA/page references.
- `firstPageSlugByModeQuery`, `modeHomeSlugsQuery`, `allPageSlugsQuery`: used for routing fallbacks and the mode switcher.

### Localization Pattern
`sanity-plugin-internationalized-array` stores locale variants as array items with `_key`. The helper `getLocaleValue` (in `src/lib/i18nUtils.ts`) pulls the active locale, falling back to Thai when translations are missing.

## UI Component Reality
- **SectionShell**: wraps sections, handles optional media background + gradient overlays via `overlayClassName`.
- **HeroSection**: currently minimal; needs hero overlay, mac-frame styling, typography upgrades to match R01 mock.
- **TwoColumnSection**: handles text/media columns with optional CTA group; background variants limited to `default`, `muted`, `contrast`.
- **CardCollectionSection**: renders up to 4 columns; lacks “featured” styling for highlighted card.
- **TimelineSection**: outputs stacked cards; no timeline connector visuals yet.
- **MediaGallerySection**: simple grid with CTA; no hover effects.
- **LogoGridSection**: even grid with minimal styling.
- **CtaBannerSection**: structural only, requires gradient + layout adjustments per mock.
- **ModeSwitcher**: client component updating cookie + theme; maps `production` → `dark`, `wedding` → `light`.
- **Navbar/Footer**: expect `SiteSettings`, but fetching logic must be introduced in layout/root to hydrate props.

## Styling & Theming Notes
- Tailwind 4 in JIT mode. Need to define tokens for:
  - Primary orange (#FF8A1E), secondary browns, deep navy/black backgrounds.
  - Off-white text and muted greys for body copy.
  - Letter spacing + uppercase utilities for section headings.
- `globals.css` currently light; plan to add CSS variables or extend Tailwind config for consistent palette.
- Buttons share `buttonVariants` (shadcn style). Add variants for orange outline/ghost as seen in mocks.

## Build, Dev & Deploy
- `npm run dev` — Next.js dev server.
- `npm run build` / `npm run start` — production build + serve.
- `npm run lint`, `npm run check-format`, `npm run format` — linting & formatting.
- Required env vars: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, optional `NEXT_PUBLIC_SANITY_API_VERSION`.
- Sanity Studio accessible under `/sanity-cms` route group.

## Testing Reality
- No automated tests. Manual QA needed for layout, localization, and mode switching.
- Recommendation: introduce unit tests (Vitest/Jest) and E2E (Playwright) once core pages are completed.

## Technical Debt & Risks
- **Design mismatch**: Section components and Tailwind tokens do not yet reflect the R01 high-frame styling (hero overlay, featured service card, timeline visuals, etc.).
- **Schema drift**: Additional fields likely required (timeline icons, featured service flag, brand logos array, CTA banner media). Must update TypeScript types and GROQ query selectors in lockstep.
- **Settings data**: Navbar/Footer expect content but fetching isn’t wired; risk of runtime nulls until implemented.
- **Localization gaps**: Some hard-coded English strings remain; ensure Sanity provides localized values.
- **Mode collisions**: Slugs shared between production and wedding require strict filtering by `siteMode`.

## Immediate Focus Recommendation
1. **Finish the Production Homepage** (`public/high-frame/R01_home_production.png`)
   - Align hero, services, timeline, previous works, brands, CTA banner, footer with the design.
   - Extend schemas/queries/types where needed (featured card, timeline step numbers + icons, brand logo array, CTA banner fields).
   - Cross-check implementation against high frame at every step.
2. **Document Sanity schema changes** and ensure TypeScript/GROQ stay in sync.
3. **Repeat for Wedding Mode** using `R01_home_wedding.png` once production baseline is complete.

## Workflow Guidance for AI Agents
- Start with this document + the relevant high-frame PNG before any change.
- When updating schemas, adjust:
  - Schema definitions in `src/sanity/schemaTypes/**`
  - Types in `src/types/sanity.ts`
  - GROQ selectors in `src/sanity/lib/queries.ts`
  - Section components in `src/components/page/sections/**`
- After each significant milestone (e.g., homepage completed), rerun `*document-project` to refresh documentation.
- Plan work as an epic with individual stories per page/major section. Each story should include:
  - Target high-frame image and acceptance criteria (visual parity, localization coverage, CMS mappings).
  - Schema and frontend updates required.
  - Data entry guidance for Sanity.

## Open Questions
- Do we need blog/behind-the-scenes pages for launch or can they wait?
- Any analytics/SEO integration requirements (Google Analytics, metadata, schema.org)?
- Future site modes beyond production/wedding?
- Confirm hosting/deployment target (Vercel assumed).

Save this file as `docs/brownfield-architecture.md` so future work references the current state.
