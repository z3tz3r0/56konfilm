# 56konfilm Portfolio Platform

A bilingual platform built with Next.js and Sanity CMS, designed to showcase 56KonFilm's diverse production excellence. The site features a dual-mode architecture that seamlessly transitions between a **Cinematic Commercial Portfolio** and a **Premium Wedding Service** — each with its own distinct visual identity and editorial flow, while remaining intuitive for the internal team to manage.

## Snapshot

- **Status**: In active development – modular sections defined, Sanity dataset wired, UI build-out in progress.
- **Target Audiences**: Prospective clients evaluating 56KON Film services, hiring partners, and future collaborators curious about team capabilities.
- **Value Prop**: Combines rich visuals, localized storytelling (Thai default, English secondary), and flexible section-driven pages to showcase the studio’s strength across TVC, film, and OEM production.

## 🏗️ Architecture Overview

### 1. Mode-Aware App Router

Routes are structured under `src/app/[lang]/[mode]`. This allows the platform to serve different business contexts (e.g., Commercial, Wedding) while maintaining:

- **Clean SEO URLs:** Persistent language (`/th`, `/en`) and mode segments.
- **Contextual UI:** Automatic layout adjustments based on the active mode.
- **Language Persistence:** Cookie-based locale detection for a seamless "Thai-first" experience.

### 2. Modular Page Builder (Section-Based)

- **Section-driven architecture:** each page is composed of pre-defined, reusable modules managed in Sanity. This "Assembler" pattern allows non-technical editors to **curate page sequences** and manage localized content—such as Hero, Timeline, and Media Galleries — without needing to manage layout code, ensuring design consistency across the site.
- **Robust Data Fetching:** Optimized GROQ queries handle localized string hydration with automatic fallbacks to ensure content parity between Thai and English.

### 3. UI & Mode-Specific Design System

A responsive interface built with Tailwind CSS, where each Sanity section dynamically adapts its visual language based on the active mode:

- **Commercial Mode:** Focuses on a cinematic dark theme, high-contrast CTAs, and bold layouts to highlight professional studio capabilities.
- **Wedding Mode:** Shifts towards a premium aesthetic. It utilizes asymmetric compositions and organic spacing to create a "hand-crafted" feel, reflecting the personalized and high-end experience provided to wedding clients.

### 4. Engineering Standards

To ensure long-term maintainability, the codebase follows strict standards:

- **Feature-Based & Colocated Structure:** Our Page Builder sections (e.g., Hero, Contact) are organized within `src/features/`. Each feature is self-contained, encapsulating its own `components/`, `validation/`, `actions/`, `types/`, etc. This minimizes cross-feature pollution and makes the architecture highly predictable.
- **Unidirectional Dependencies:** Shared layers never import from Feature layers.
- **Naming Conventions:** Kebab-case for folders, PascalCase for Components, and camelCase for files.
- **Validated Env:** Strict environment variable checking via Zod.
- **Strategic Colocation:** We keep logic, types, and styles close to the components they serve. This reduces complexity and improves developer velocity. Detailed rules can be found in our [Folder Structure Docs](https://github.com/z3tz3r0/56konfilm/blob/main/docs/FOLDER_STRUCTURE.md).

## 🛠️ Technology Stack

- **Framework**: Next.js 16.x (App Router, Server Components)
- **CMS**: Sanity Studio (embedded at `/sanity-cms` with custom structure + localized workflow)
- **Styling**: Tailwind CSS with `next/font` (Geist) and SVG/icon support
- **Data Fetching**: `next-sanity` client with typed GROQ queries and server-side caching
- **Quality Control:** TypeScript, Husky (Pre-commit hooks), ESLint, and Prettier

## 📝 Documentation

For detailed guidelines on how to contribute or understand the codebase, please refer to:

- 📂 [Folder Structure](https://github.com/z3tz3r0/56konfilm/blob/main/docs/FOLDER_STRUCTURE.md) - How we organize our files.
- 🔗 [Import Policies](https://github.com/z3tz3r0/56konfilm/blob/main/docs/IMPORT_POLICIES.md) - Rules for dependencies and barrel exports.

## 👨‍💻 Highlights for Recruiters & Partners

- Delivered a **fully modular marketing site** that enables non-technical editors to launch new service pages by mixing sections—no developer intervention required.
- Implemented **cookie-based locale detection** ensuring Thai-first experience while keeping URLs clean for SEO sharing.
- Created a **scalable schema suite** (timeline, gallery, card grid, CTA banner) that can be reused across future campaigns without schema rewrites.
- Ensured **content parity safeguards** through GROQ fallbacks and shared helpers, reducing risk of untranslated copy in production.

## ⚙️ Setup & Configuration

### Prerequisites

- Node.js: 24.5
- Package Manager: pnpm

### Getting Started

#### 1. **Clone & Install:**

```bash
pnpm install
```

#### 2. **Environment Variables:**

Copy .env.example to .env.local and fill in your Sanity Project ID and API Version (2025-08-12).

#### 3. **Run Development Server:**

```bash
pnpm dev
```

#### 4. Sanity Webhook (On-demand Revalidation)

To enable on-demand revalidation, configure a webhook in the Sanity project management (sanity.io/manage):

1. **URL**: `https://[YOUR_PRODUCTION_URL]/api/revalidate`
2. **Trigger on**: Create, Update, Delete
3. **Filter**: `_type in ["page", "project", "settings"] && !(_id in path("drafts.**"))`
4. **Projection**:

```
{
    "_type": _type,
    "page": {
        "mode": siteMode,
        "slug": slug.current
    }
}
```

5. **Secret**: Set a secure secret and add it as `SANITY_REVALIDATE_SECRET` in your environment variables.

## 🗺️ Roadmap

- Finish UI components for all section types and connect them to live Sanity content.
- Extend testing coverage (`npm run lint` currently flags placeholder `any` types) and introduce visual regression snapshots once the design stabilizes.
- Integrate analytics and lightweight lead-gen forms tailored to 56KON Film business goals.

## ☎️ Contact

Interested in collaborations or learning more about the build? Reach out via the 56KON Film team or connect with the project maintainer directly.
