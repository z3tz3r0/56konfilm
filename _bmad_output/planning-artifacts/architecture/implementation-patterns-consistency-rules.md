# Implementation Patterns & Consistency Rules

## Naming Patterns
- **Components:** `PascalCase` (e.g., `VideoGridItem.tsx`).
- **Hooks:** `camelCase` starting with `use` (e.g., `useMode.ts`).
- **Sanity Fields:** `camelCase` (e.g., `siteMode`, `contentBlocks`).
- **CSS Variables:** `kebab-case` (e.g., `--primary-orange`, `--bg-wedding`).

## Dual-Mode Style Logic
1.  **Strictly Component-based:** Large layout `if/else` is forbidden. Use `ModeProvider` to toggle a global `[data-mode]` attribute.
2.  **CSS Variable Overrides:** Components must use Tailwind 4 variables defined in `globals.css` under mode-specific selectors (e.g., `@theme { --primary: #ff7b07; }` for production).
3.  **Typography Parity:** Automate font switching via CSS classes tied to the active mode.

## Atomic GROQ Composition (Data Fetching Pattern)
Queries are tiered to ensure performance and prevent context bloat:
1.  **Fragments** (`src/sanity/lib/queries/fragments.ts`): Reusable atoms like `LOCALIZED`, `IMAGE_PROJECTION`, `CTA_PROJECTION`.
2.  **Sections** (`src/sanity/lib/queries/sections.ts`): Module-level projections for each Content Block (e.g., `HERO_SECTION`).
3.  **Pages** (`src/sanity/lib/queries.ts`): The final assembly point in React Server Components where Fragments and Sections are composed into a single fetch.

## Enforcement Guidelines
- **AI Agents MUST** verify if a Fragment exists before writing new projection logic.
- **AI Agents MUST** update `src/types/sanity.ts` immediately after any query change.
- **No Over-fetching:** Explicit projections only; fetching entire objects (`*`) is forbidden.
