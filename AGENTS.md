# Repository Guidelines

## Project Structure & Module Organization

This repository is a Next.js App Router site with Sanity CMS.

- `src/app/[lang]`: localized routes (`/th`, `/en`) plus API routes in `src/app/api`.
- `src/components`: UI and feature modules (`features/`, `navigation/`, `seo/`, `ui/`).
- `src/sanity`: schema definitions, Sanity client utilities, and Studio components.
- `src/lib`, `src/hooks`, `src/stores`, `src/types`, `src/actions`: shared logic, state, and typing.
- `public/`: static assets.
- `tests/`: `unit/`, `api/`, `e2e/`, and reusable support in `tests/support/`.
- `scripts/`: utility scripts (Node version check, CMS/media tooling).

## Build, Test, and Development Commands

Read the `package.json` for the full list of scripts.

## Search & CLI Preference

- Prefer `rg` (ripgrep) over `grep` for text and file searches; it is faster and respects ignore rules.
- Examples: `rg "ModeSwitcher" src tests` and `rg --files src tests`.

## Coding Style & Naming Conventions

- TypeScript-first (`.ts`/`.tsx`).
- Formatting via Prettier (`.prettierrc`) with Tailwind plugin.
- Linting via ESLint 9 + Next config (`eslint.config.mjs`).
- Follow Prettier defaults (2-space indentation).
- Naming:
  - Components: `PascalCase` (e.g., `ModeSwitcher.tsx`).
  - Hooks/utilities: `camelCase`.
  - Route/feature folders: lowercase or kebab-case.

## Testing Guidelines

- Frameworks: Playwright (E2E) and Vitest (unit/API).
- Test files: `*.spec.ts` or `*.spec.tsx`.
- Prefer `data-testid` selectors for stable E2E tests.
- Recommended pre-PR check:
  `pnpm run lint && pnpm exec vitest && pnpm run test:e2e`

## Commit & Pull Request Guidelines

- Follow Conventional Commits used in history: `feat(scope): ...`, `fix(scope): ...`, `refactor: ...`, `docs: ...`, `chore: ...`.
- Keep each commit focused on one change set.
- PRs should include summary, rationale, linked issue/task, test evidence, and screenshots/GIFs for UI changes.

## Security & Configuration Tips

- Copy `.env.example` and keep secrets out of git.
- Runtime requirement: Node `>=24.5.0 <25` (checked by `pnpm run predev`).
- Keep `SANITY_REVALIDATE_SECRET` in environment variables only.
