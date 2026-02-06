# Story 3.1: Wedding Mode Skinning

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Visitor**,
I want **the website to change its entire look and feel when I switch to Wedding Mode**,
so that **I feel I am in a romantic, studio environment rather than a raw production house.**

## Acceptance Criteria

1. **Given** I click "Wedding Mode" in the `ModeSwitcher`
   **When** the `GlobalTransition` (CurtainWipe) completes
   **Then** the `html[data-mode]` should update to `wedding`
   **And** the theme variables in `globals.css` should switch to Wedding values (Ivory White bg, Brown text).

2. **Given** I am in **Wedding Mode**
   **Then** the primary font should switch from `Sora` (Production) to `Cormorant Garamond` (Wedding) for headers
   **And** the `ModeSwitcher` indicator should slide smoothly to the Wedding position.

3. **Given** various sections (Hero, TwoColumn, etc.)
   **When** viewed in Wedding Mode
   **Then** they must use the `--color-ivory-white`, `--color-brown`, and `--color-mocha-brown` variables.

4. **Given** I navigate between pages (Home, About, Contact)
   **When** I am in Wedding Mode
   **Then** the "Skin" must persist correctly across all routes.

5. **Given** video elements (if applicable in this story scope)
   **When** in Wedding Mode
   **Then** speed/accents should feel "Slow/Cinematic" (as per Epic 3 business requirements).

## Tasks / Subtasks

- [x] **Infrastructure: Persistence Verification** (AC: #4)
  - [x] Verify `ModeProvider` correctly hydrations from 'mode' cookie.
  - [x] Ensure `next-themes` and `data-mode` are perfectly synced on root `html` tag.
- [x] **Styling: CSS Variable Mapping** (AC: #1, #3)
  - [x] Audit `src/app/globals.css` to ensure all `@theme` variables are correctly overridden in `.dark, [data-mode="production"]` vs root (Wedding baseline).
  - [x] Verify `h1-h4` font-family fallback order for Wedding mode.
- [x] **Component: ModeSwitcher Enhancement** (AC: #2)
  - [x] Ensure `handleModeChange` triggers the `GlobalTransition` effectively before navigation.
  - [x] Verify colors used in `ModeSwitcher` motion properties match the brand guide (`#5b4339` for Wedding).
- [x] **Validation: Cross-Page Stability** (AC: #4)
  - [x] Test mode persistence during hard reloads.
  - [x] Verify no "Flicker of Unstyled Content" (FOUC) during mode shifts.

## Dev Notes

- **Mode Logic:** We use `SiteMode` (production/wedding) which maps to `Theme` (dark/light).
- **Styling:** Tailwind 4 `@theme` block in `globals.css` is the source of truth.
- **Reference Assets:** 
  - `public/high-frame/R00_Portfolio_Wedding.png`
  - `_bmad_output/planning-artifacts/design-assets/wedding/common/section-navigation-desktop.png`

### Project Structure Notes

- **Providers:** `src/components/providers/ModeProvider.tsx`
- **Navigation:** `src/components/navigation/ModeSwitcher.tsx`
- **Transitions:** `src/components/layout/GlobalTransition.tsx`

### References

- [Source: _bmad_output/planning-artifacts/epics/epic-3-wedding-mode-conversion-the-emotional-layer.md#Story 3.1]
- [Source: src/app/globals.css]

## Dev Agent Record

### Agent Model Used

Antigravity (M18)

### File List

- `src/app/globals.css`
- `src/app/[lang]/layout.tsx`
- `src/components/navigation/ModeSwitcher.tsx`
- `src/components/providers/ModeProvider.tsx`
- `tests/e2e/wedding-mode-validation.spec.ts`
- `tests/e2e/wedding-mode-skinning.spec.ts`
- `tests/e2e/debug-mode.spec.ts`
- `tests/support/fixtures/index.ts`
- `playwright.config.ts`
