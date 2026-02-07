# Story 4.1: SEO & Metadata Perfection

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Content Admin**,
I want **every page to automatically have the correct Title, Description, and OG Image**,
so that **links shared on social media look professional and Google indexes the site correctly.**

## Acceptance Criteria

1. **Given** I create a new "Project" or "Page" in Sanity  
   **When** I publish it  
   **Then** the frontend should generate dynamic metadata (using `generateMetadata`) including OG images and descriptions.

2. **Given** the site is deployed  
   **When** I access `/sitemap.xml`  
   **Then** it should list all active routes (Projects, Pages) dynamically from Sanity.

3. **Given** I verify `robots.txt`  
   **Then** it should Allow all bots on the Production domain and Disallow all on the Staging domain.

4. **Given** I am on a Project Detail page  
   **Then** the page should include valid `VideoObject` structured data (JSON-LD) if a video is present.

5. **Given** the user switches language  
   **Then** `canonical` and `hreflang` tags must update to reflect the current language and its alternate.

## Tasks / Subtasks

### Epic Task 1: Sanity Schema Enhancements
- [x] **Create `seo` object schema** (`src/sanity/schemaTypes/objects/seo.ts`)
  - Fields: `title` (localized), `description` (localized), `ogImage` (image)
- [x] **Update `Page` schema** (`src/sanity/schemaTypes/page.ts`)
  - Add `seo` object to the `seo` group.
- [x] **Update `Project` schema** (`src/sanity/schemaTypes/projects.ts`)
  - Add `seo` object to the `seo` group.
- [x] **Update `Settings` schema** (`src/sanity/schemaTypes/settings.ts`)
  - Add `seo` object for global fallback metadata.

### Epic Task 2: Metadata Core Implementation
- [x] **Create `src/lib/metadata.ts` utility**
  - Implement a shared helper to construct metadata objects from Sanity SEO data.
  - Handle fallbacks to Global Settings.
- [x] **Update `src/app/[lang]/layout.tsx`**
  - Use the shared metadata helper for global site-wide defaults.
- [x] **Update `src/app/[lang]/[slug]/page.tsx`**
  - Implement dynamic `generateMetadata` fetching from the page document.
- [x] **Update `src/app/[lang]/work/[slug]/page.tsx`**
  - Implement dynamic `generateMetadata` fetching from the project document.

### Epic Task 3: Technical SEO (Sitemap & Robots)
- [x] **Create `src/app/sitemap.ts`**
  - Fetch all pages and projects from Sanity and generate a valid Next.js sitemap.
- [x] **Create `src/app/robots.ts`**
  - Implement environment-based rules (Allow for Prod, Disallow for others).

### Epic Task 4: Structured Data (JSON-LD)
- [x] **Implement `JsonLd` component** (`src/components/seo/JsonLd.tsx`)
- [x] **Add `VideoObject` to Project Detail pages**
  - Extract video metadata (title, thumbnail, upload date) from Sanity project document.

## Dev Notes

- **Next.js 16 Compatibility:** Use the latest Metadata API patterns.
- **Sanity GROQ:** Ensure queries fetch the new `seo` fields.
- **Localization:** Use `internationalizedArrayString` patterns for SEO fields.
- **Performance:** Ensure `generateMetadata` fetches are efficient/cached.

### Project Structure Notes

- New SEO object in `src/sanity/schemaTypes/objects/seo.ts`.
- Standard Next.js route handlers for sitemap/robots in `src/app/`.
- Shared utility for metadata in `src/lib/metadata.ts`.

### References

- [Source: `_bmad_output/planning-artifacts/prd/7-web-app-specific-requirements.md#metadata-technical-seo`]
- [Source: `_bmad_output/planning-artifacts/prd/9-non-functional-requirements-quality-attributes.md#seo-discoverability`]
- [Source: `_bmad_output/planning-artifacts/epics/epic-4-cms-mastery-operational-efficiency-admin-power.md#Story 4.1`]

## Dev Agent Record

### Agent Model Used

Antigravity (Codex v6)

### Debug Log References
- 2026-02-07: RED phase verified with `npx playwright test tests/e2e/seo-metadata-perfection.spec.ts tests/e2e/seo-routes.spec.ts` (15 failures expected pre-implementation).
- 2026-02-07: GREEN validation passed for SEO scope with `npx playwright test tests/e2e/seo-metadata-perfection.spec.ts tests/e2e/seo-routes.spec.ts --project=chromium` (5/5 passing).
- 2026-02-07: Regression spot-check passed with `npx playwright test tests/e2e/mode-persistence.spec.ts tests/e2e/global-transition.spec.ts --project=chromium` (5/5 passing).
- 2026-02-07: `npm run lint` currently blocked by pre-existing ESLint config issue (`TypeError: Converting circular structure to JSON`).
- 2026-02-07: `npx tsc --noEmit` currently blocked by pre-existing implicit-any errors in existing tests (`tests/e2e/contact-form-routing.spec.ts`, `tests/e2e/dual-context-about.spec.ts`).

### Implementation Plan
- Introduced a reusable metadata builder (`src/lib/metadata.ts`) to centralize canonical/hreflang/open graph/twitter metadata generation with SEO fallback resolution from Settings.
- Extended Sanity schema + GROQ projections to include `seo { title, description, ogImage }` for Settings/Page/Project and synchronized TypeScript interfaces.
- Implemented technical SEO routes (`sitemap.ts`, `robots.ts`) as Next.js metadata routes using dynamic Sanity-driven slugs.
- Added JSON-LD `VideoObject` injection on project detail pages when video content exists.
- Fixed runtime blocker by removing forbidden cookie writes from Server Component layout (`src/app/[lang]/[slug]/layout.tsx`) to prevent 500 errors during metadata route/page access.

### Completion Notes List
- Implemented Story 4.1 end-to-end: schema updates, metadata utility adoption across app routes, dynamic sitemap/robots, and project-level VideoObject JSON-LD.
- Added SEO-focused E2E coverage (`seo-metadata-perfection.spec.ts`, `seo-routes.spec.ts`) and stabilized assertions for robots header case and language switch fallback flow.
- Updated project query composition to preserve existing fragment-based architecture while adding SEO projections and route slug queries.

### File List
- src/sanity/schemaTypes/objects/seo.ts
- src/sanity/schemaTypes/page.ts
- src/sanity/schemaTypes/projects.ts
- src/sanity/schemaTypes/settings.ts
- src/sanity/schemaTypes/index.ts
- src/sanity/lib/queries/fragments.ts
- src/sanity/lib/queries.ts
- src/types/sanity.ts
- src/types/siteSettings.ts
- src/lib/metadata.ts
- src/app/[lang]/layout.tsx
- src/app/[lang]/[slug]/page.tsx
- src/app/[lang]/work/[slug]/page.tsx
- src/app/[lang]/[slug]/layout.tsx
- src/app/sitemap.ts
- src/app/robots.ts
- src/components/seo/JsonLd.tsx
- tests/e2e/seo-metadata-perfection.spec.ts
- tests/e2e/seo-routes.spec.ts
- tests/support/factories/seo.factory.ts

## Change Log
- 2026-02-07: Implemented Story 4.1 SEO metadata architecture, Sanity SEO schema integration, dynamic technical SEO routes, and VideoObject structured data. Status moved to `review`.
