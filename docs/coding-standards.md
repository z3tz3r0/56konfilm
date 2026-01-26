# 56KonFilm Coding Standards

This project uses Next.js 15 with TypeScript, Tailwind CSS 4, and Sanity CMS. Follow these conventions so new work stays consistent and easy to maintain.

## General Principles
- **Type Safety**: Use TypeScript everywhere. Define explicit props/return types for components, hooks, and utilities.
- **Server vs. Client Components**: Default to server components. Only add `'use client'` when interactions or browser APIs require it.
- **Localization First**: Assume every user-facing string needs Thai + English. Pull copy from Sanity or localized utilities; avoid hard-coded strings.
- **Cross-Check with Design**: Reference `public/high-frame/R01_*.png` for layout, spacing, and typography. Stay pragmatic but note any intentional deviations.

## File & Module Organization
- Keep Next.js routes in `src/app`. Localized pages live under `src/app/[locale]` (future work) or use locale-aware helpers.
- Shared UI components: `src/components` with PascalCase filenames; co-locate styles if a component needs custom CSS.
- Reusable logic/hooks go in `src/hooks` (create file if not present yet). Utilities stay in `src/lib` with camelCase filenames.
- Sanity schemas and GROQ helpers live in `src/sanity`. When adding schema fields, update corresponding types and queries in the same change.

## Styling & Tailwind
- Tailwind is the primary styling tool; avoid standalone CSS unless necessary.
- Group semantic sections with `container`, use responsive spacing classes (`py-24 md:py-32`, etc.).
- Define shared color/spacing tokens in `globals.css` or Tailwind config (e.g., `--color-primary` for #FF8A1E).
- For recurring patterns (uppercase section labels, gradient overlays), create utility classes or component props instead of duplicating class strings.

## Components & Props
- Use PascalCase component names and TypeScript interfaces for props.
- Keep components focused; prefer composition over deeply nested conditionals.
- Return early when there is no content (e.g., CTA groups without buttons should render `null`).
- For shared functionality (e.g., CTA buttons), rely on existing primitives (`CtaButton`, `CtaGroup`, `SectionShell`). Extend them rather than creating duplicates.

## Sanity Integration
- Add fields with localized helpers (`localizedStringField`, `localizedTextField`) to keep Thai/English parity.
- Update TypeScript types (`src/types/sanity.ts`) immediately after schema changes.
- Reflect new fields in GROQ queries in `src/sanity/lib/queries.ts` and ensure fallback logic (`getLocaleValue`) still works.
- Validate schemas with `Rule` to prevent editors from saving incomplete content.

## Commit & Review Practices
- Follow Conventional Commits: `feat: ...`, `fix: ...`, etc., including scope when relevant (`feat(home): ...`).
- Run `npm run lint` and `npm run check-format` before commits.
- Document major changes or assumptions in the brownfield architecture doc or relevant story.

## Testing & QA
- Manual testing: check production and wedding modes after changes, in both locales.
- Add unit/E2E tests as the project grows (Vitest/Jest for units, Playwright for E2E).
- Use realistic Sanity content during QA to catch localization/image edge cases.

## Accessibility & Performance
- Maintain color contrast (especially orange on dark backgrounds). Use semantic HTML (`nav`, `section`, `footer`).
- Ensure focus states are visible and keyboard navigation works for interactive elements.
- Optimize media via `urlFor(...).width(...).quality(...)` and lazy loading where possible.

## Documentation Hygiene
- Update `docs/brownfield-architecture.md` after major structural changes.
- If documentation becomes too long, shard into focused files (**Epic-specific details**, **Sanity model notes**, etc.). Until then, keep everything in the main architecture doc plus this standards guide.
