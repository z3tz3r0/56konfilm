# Story 1.4: Bilingual SEO Foundation for Commercial

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Search Engine (Google)**,
I want **to clearly understand which content is Thai vs English**,
so that **I can serve the correct language version to the correct user.**

## Acceptance Criteria

### 1. HTML & SEO Structure (`lang` & `hreflang`)
- **Given** the site is rendered in English (default or selected)
- **When** the HTML response is received
- **Then** the `<html>` tag must have `lang="en"`.
- **And** the `<head>` must contain:
  - `<link rel="alternate" hreflang="en" href="https://.../..." />`
  - `<link rel="alternate" hreflang="th" href="https://.../th/..." />`
- **Constraint:** Use **Path-based routing** (`/th/...`) for maximum SEO effectiveness as per Next.js 16 best practices.
- **Correction:** `src/app/layout.tsx` currently hardcodes `lang="en"`. This MUST be dynamic.

### 2. Next.js 16 Proxy (formerly Middleware)
- **Constraint:** Use the new **Next.js 16 `proxy.ts`** convention (not `middleware.ts`).
- **Goal:** Intercept requests to handle `Accept-Language` headers and rewrite/redirect users to the correct localized path (e.g., `/` -> `/th` if Thai preferred).
- **Current State:** `src/proxy.ts` exists but **does not perform rewrites/redirects** to path-based routes (it currently only sets cookies). It MUST be updated to support the `/th` prefix logic.

### 3. Language Switching (Soft Navigation)
- **Given** the user is viewing the site in English
- **When** they click "TH" in the navigation
- **Then** the URL should change to `/th/...`.
- **And** the content should update to Thai instantly.
- **And** the page should NOT do a full hard reload (Soft Navigation).
- **Implementation:** Create/Update `LanguageSwitcher.tsx` (Component doesn't exist yet) to use Next.js `<Link>` with the correct locale prefix.

### 4. Sanity Content Localization
- **Given** a content editor is in Sanity Studio
- **When** they edit the "Hero Text"
- **Then** they should see inputs for both English and Thai.
- **And** the API response should return the correct string based on the current locale.
- **Current State:** `src/sanity/schemaTypes/page.ts` defines `seoTitle` and `page` as strict strings. These MUST be converted to `internationalizedArrayString` (helper exists in `src/sanity/schemaTypes/objects/localized.ts` but is not applied to Page type yet).

## Tasks / Subtasks

- [x] **Task 1: Project Structure Refactor (Path-based)** (AC: 1)
  - [x] Move `src/app/(site)` content into `src/app/[lang]` to support path-based i18n.
  - [x] Update `generateStaticParams` to build both `/en` and `/th` paths.
  - [x] Fix `src/app/layout.tsx` (now `src/app/[lang]/layout.tsx`) to accept `params.lang` and set `<html lang={lang}>`.
  - [x] **Critical Check:** Ensure `ModeProvider` (Cookie-based) continues to work alongside `[lang]` (Path-based).

- [x] **Task 2: Next.js 16 Proxy Upgrade** (AC: 2)
  - [x] Update `src/proxy.ts` (Existing file) to support **path rewrites/redirects** logic (`/th/...`).
  - [x] Currently, `proxy.ts` only sets cookies. Expand it to inspect the URL path and rewrite/redirect based on locale negotiation.

- [x] **Task 3: SEO Metadata (Hreflang)** (AC: 1)
  - [x] Implement `generateMetadata` in `sections` or `page.tsx` to return `alternates` (languages).
  - [x] Construct canonical URLs dynamically based on `lang` param.

- [x] **Task 4: Sanity & Content Integration** (AC: 4)
  - [x] **Create/Update Component:** `LanguageSwitcher.tsx` (Currently missing).
  - [x] Update `src/sanity/schemaTypes/page.ts`: Change `seoTitle` and `page` (name) fields to use localized types.
  - [x] Update GROQ Query `src/sanity/lib/queries.ts`: Ensure `$lang` parametrizes the fetch.

## Dev Notes

### What is ALREADY DONE:
- **Proxy Stub:** `src/proxy.ts` exists but is incomplete (only sets cookies, no path logic).
- **Localization Utils:** `src/lib/i18nUtils.ts` exists and contains strong logic for preference detection (Reuse this!).
- **Sanity Helpers:** `src/sanity/schemaTypes/objects/localized.ts` exists (Reuse this definition!).

### What is MISSING / NEEDS WORK:
- **Path Structure:** `src/app/[lang]` does NOT exist.
- **Components:** `LanguageSwitcher.tsx` does NOT exist.
- **Schema Usage:** `page.ts` does NOT use the localized helpers yet.
- **Refactor Warning:** Moving files to `src/app/[lang]` is a high-impact change. verify `layout.tsx` nesting carefully.

### Project Structure Notes

- **Refactor:** `src/app/(site)` -> `src/app/[lang]`
- **Update:** `src/proxy.ts`

### References

- **Documentation:** Next.js 16 Routing & Proxy (formerly Middleware).
- **Epic:** `_bmad_output/planning-artifacts/epics/epic-1-dual-identity-foundation-commercial-mode-the-brutal-core.md`

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

- Tests passed after structure migration.

### Completion Notes List

- Refactored project structure to `src/app/[lang]` for path-based i18n.
- Updated `proxy.ts` to handle locale redirection (`/` -> `/en` or `/th`) and cookie synchronization.
- Implemented `LanguageSwitcher` component (path-preserving) and added it to `Navbar`.
- Updated Sanity `page` Schema and Queries to use localized fields (`internationalizedArrayString`).
- Implemented `generateMetadata` in dynamic pages to support `hreflang` and `canonical` tags.
- Added `metadataBase` to ensure absolute `hreflang`/`canonical` URLs.
- Added home (`/[lang]`) metadata for `hreflang` + `canonical`.
- Made Navbar/ModeSwitcher lang-aware to preserve locale on navigation.
- Synced `sanity-cms` layout `lang` with cookies.

### File List

- src/app/[lang]/layout.tsx
- src/app/[lang]/page.tsx
- src/app/[lang]/[slug]/page.tsx
- src/app/[lang]/[slug]/layout.tsx
- src/app/sanity-cms/layout.tsx
- src/proxy.ts
- src/sanity/schemaTypes/page.ts
- src/sanity/lib/queries.ts
- src/components/navigation/LanguageSwitcher.tsx
- src/components/navigation/Navbar.tsx
- src/components/navigation/ModeSwitcher.tsx
- tests/e2e/bilingual-seo.spec.ts
