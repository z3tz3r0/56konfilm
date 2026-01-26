# 56konfilm Portfolio Platform

A bilingual production-house portfolio built with Next.js and Sanity CMS. The site highlights cinematic case studies, service offerings, and workflow storytelling for 56KON Film while keeping the editorial process friendly for a small internal team.

## Snapshot
- **Status**: In active development – modular sections defined, Sanity dataset wired, UI build-out in progress.
- **Target Audiences**: Prospective clients evaluating 56KON Film services, hiring partners, and future collaborators curious about team capabilities.
- **Value Prop**: Combines rich visuals, localized storytelling (Thai default, English secondary), and flexible section-driven pages to showcase the studio’s strength across TVC, film, and OEM production.

## Architecture Overview
- **App Router + Server Components**: All routes live in `src/app`; localization is determined by a `lang` cookie (defaulting to Thai) instead of URL segments. Cookie middleware keeps language persistent across visits.
- **Modular Page Builder**: Each page document in Sanity composes reusable sections—hero, two-column narratives, service grids, timeline process, media gallery, logo wall, and CTA banners. GROQ queries hydrate localized strings with fallbacks.
- **Localization Model**: Internationalized array fields for strings/text keep Thai and English content in parity. Shared helper schemas (`localizedBlock`, `cta`, `mediaBlock`, etc.) enforce consistent structure across modules.
- **UI Layer**: React components (Next.js + Tailwind) map each section type to a design system element. Focus is on cinematic layouts, dark theme, high-contrast CTAs, and mobile-first responsiveness.

## Technology Stack
- **Framework**: Next.js 16.x (App Router, Turbopack dev mode)
- **CMS**: Sanity Studio (embedded at `/sanity-cms` with custom structure + localized workflow)
- **Styling**: Tailwind CSS with `next/font` (Geist) and SVG/icon support
- **Data Fetching**: `next-sanity` client with typed GROQ queries and server-side caching
- **Tooling**: TypeScript, ESLint/Prettier (Tailwind plugin), pnpm scripts for lint/format/build

## Highlights for Recruiters & Partners
- Delivered a **fully modular marketing site** that enables non-technical editors to launch new service pages by mixing sections—no developer intervention required.
- Implemented **cookie-based locale detection** ensuring Thai-first experience while keeping URLs clean for SEO sharing.
- Created a **scalable schema suite** (timeline, gallery, card grid, CTA banner) that can be reused across future campaigns without schema rewrites.
- Ensured **content parity safeguards** through GROQ fallbacks and shared helpers, reducing risk of untranslated copy in production.

## Roadmap
- Finish UI components for all section types and connect them to live Sanity content.
- Extend testing coverage (`npm run lint` currently flags placeholder `any` types) and introduce visual regression snapshots once the design stabilizes.
- Integrate analytics and lightweight lead-gen forms tailored to 56KON Film business goals.

## Contact
Interested in collaborations or learning more about the build? Reach out via the 56KON Film team or connect with the project maintainer directly.
