# Story 1.1: ModeProvider Refactoring & State Persistence

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **User**,
I want **my selected viewing mode (Commercial/Wedding) to be remembered**,
so that **I don't have to switch modes every time I refresh or return to the site.**

## Acceptance Criteria

1. **Default State**:
   - **Given** the user lands on the site for the first time (no cookie),
   - **When** the site loads,
   - **Then** the default mode MUST be `production` (Commercial).
   - **And** a cookie named `mode` MUST be set to `production`.
   - **And** the `next-themes` theme MUST be set to `dark`.

2. **Persistence**:
   - **Given** the user switches the mode to `wedding`,
   - **When** they refresh the page OR open a new tab,
   - **Then** the site should initialize in `wedding` mode immediately.
   - **And** the `cookie` should be `mode=wedding`.
   - **And** the `next-themes` theme should be `light`.
   - **And** the `<html>` element MUST have `data-mode="wedding"`.

3. **Architecture Implementation**:
   - **Given** the developer is inspecting the code,
   - **Then** state MUST be managed by a custom hook `useMode` (using Zustand inside).
   - **And** it must synchronize with `next-themes`, `Cookies`, and `data-mode` attribute.
   - **And** `middleware.ts` (if available) or Server Components must read the cookie for initial state.

4. **Zero Layout Shift**:
   - **Given** a mode is persisted,
   - **When** the page hydrates,
   - **Then** there must be NO flash of incorrect content/theme.

## Tasks / Subtasks

- [x] **Task 1: Create Mode Hook (Zustand)** (AC: 3)
  - [x] Create `src/hooks/useMode.ts` (NOT `src/stores/`).
  - [x] Define helper `useModeStore` internally or in separate file if preferred, but expose via hook.
  - [x] Implement `toggleMode` action that updates: Zustand state, `next-themes`, Cookie, and `data-mode` attribute.
  - [x] Reuse `SiteMode` type from `@/lib/preferences`.

- [x] **Task 2: Refactor ModeSwitcher & Integration** (AC: 1, 2)
  - [x] Refactor `src/components/navigation/ModeSwitcher.tsx` to use `useMode`.
  - [x] Remove local state and manual cookie setting from the component; delegate to the hook.
  - [x] **[PRESERVE]** Keep the pure `useEffect` logic responsible for animation/transition states.

- [x] **Task 3: Provider & Server Sync** (AC: 4)
  - [x] Create `src/components/providers/ModeProvider.tsx`.
  - [x] It should accept `initialMode` prop (read from cookies in `layout.tsx`).
  - [x] Initialize the store/hook with `initialMode` to prevent hydration mismatch.
  - [x] Wrap application (or `layout.tsx` children) with `ModeProvider`.

- [x] **Task 4: Testing**
  - [x] Write Unit test for `useMode` hook.
  - [x] Verify E2E (`tests/e2e/mode-persistence.spec.ts`) passes.
  - [x] Reference `testing-conventions.md` for `toHaveClass` assertions (checking `data-mode` and `class="dark/light"`).



- **Review Follow-ups (AI)**
  - [x] [AI-Review][HIGH] Ensure first-load sets `mode=production` cookie when missing (AC1 requires MUST). [src/hooks/useMode.ts:36]
  - [x] [AI-Review][HIGH] Eliminate theme/layout flash: ensure server markup applies correct theme class/variables for `production` (not just client `defaultTheme`). [src/app/layout.tsx:47]
  - [x] [AI-Review][HIGH] Validate `mode` cookie value server-side (use `isSupportedMode`) instead of unsafe cast to `SiteMode`. [src/app/layout.tsx:42]
  - [x] [AI-Review][HIGH] Remove render-time side effect in `ModeProvider` (`useModeStore.setState` during render); move to effect/init-safe pattern. [src/components/providers/ModeProvider.tsx:20]
  - [x] [AI-Review][HIGH] Align styling strategy: either style via `[data-mode]` or guarantee `.dark` is present for production on first paint. [src/app/globals.css:71]
  - [x] ~~[AI-Review][HIGH] Make “defer navigation until after animation completes” true (don’t use `setTimeout(..., 0)`); sync with animation completion/duration.~~ **[WAIVED]** User strict constraint: Keep `setTimeout(..., 0)` for optimistic UI/cinematic feel.
  - [x] [AI-Review][MEDIUM] Update story “File List” to include untracked `tests/e2e/mode-persistence.spec.ts` and fix formatting for `vitest.config.ts`. [_bmad_output/implementation-artifacts/1-1-mode-provider-refactoring-state-persistence.md:110]
  - [x] [AI-Review][MEDIUM] Update “Implementation Status Analysis” table: it currently claims key files are missing, but they exist. [_bmad_output/implementation-artifacts/1-1-mode-provider-refactoring-state-persistence.md:73]
  - [x] [AI-Review][MEDIUM] Fix misleading comment about “data-theme helps next-themes” (this setup uses `attribute="class"`). [src/app/layout.tsx:46]
  - [x] ~~[AI-Review][LOW] Remove unnecessary `await` on `cookies()` call for clarity.~~ **[WAIVED]** Next.js 16 requires async `cookies()`. [src/app/layout.tsx:40]

## Dev Notes

- **Refactoring Target**: `src/components/navigation/ModeSwitcher.tsx`.
- **Project Structure**:
  - `src/hooks/useMode.ts` - Main logic.
  - `src/components/providers/ModeProvider.tsx` - Context/Hydration wrapper.
  - `src/lib/preferences.ts` - `SiteMode` type source.

### Implementation Status Analysis

| Component | Status | Action Required |
|-----------|--------|-----------------|
| `src/hooks/useMode.ts` | ✅ Implemented | **Create New**. Must contain Zustand store and action logic. |
| `src/components/providers/ModeProvider.tsx` | ✅ Implemented | **Create New**. Client Component wrapper for hydration. |
| `src/components/navigation/ModeSwitcher.tsx` | ✅ Refactored | **Modify**. Remove `useState`/`document.cookie`. Replace with `useMode`. Preserve animation logic. |
| `src/app/layout.tsx` | ✅ Updated | **Modify**. Read cookie headers. Wrap children with `ModeProvider` passing `initialMode`. |

### Architecture Compliance
- **State Management**: Zustand 5.0 (encapsulated in hook/store).
- **Styling**: `next-themes` + `data-mode` for Tailwind 4.
- **Directory Structure**:
  - Hooks -> `src/hooks/`
  - Providers -> `src/components/providers/`

### Code Reference
```typescript
import { SiteMode } from '@/lib/preferences';
import { useTheme } from 'next-themes';
import { create } from 'zustand';

interface ModeState {
  mode: SiteMode;
  setMode: (mode: SiteMode) => void;
}
```

### Out of Scope
- CurtainWipe Animation (handled in Story 1.2).
- `middleware.ts` implementation (assumed handled or deferred; focus on Client/Server Component sync).

## Dev Agent Record

### Agent Model Used
BMad Create-Story Workflow / Gemini 2.0 Flash (Quality Review Applied)

### File List
- `src/hooks/useMode.ts`
- `src/hooks/useMode.test.ts`
- `src/components/providers/ModeProvider.tsx`
- `src/components/navigation/ModeSwitcher.tsx`
- `src/app/layout.tsx`
- `vitest.config.ts`
- `tests/e2e/mode-persistence.spec.ts`

## Senior Developer Review (AI)

Date: 2026-01-30

Outcome: Changes Requested (action items created)

Summary:
- High: 6
- Medium: 3
- Low: 1

Notes:
- AC1 is not fully met: first-load cookie `mode=production` is not guaranteed.
- AC4 is at risk: initial CSS defaults to light variables; server does not guarantee `.dark` on first paint.
- Server cookie parsing should validate supported values to avoid invalid mode/theme state.

## Change Log

- 2026-01-30: Senior Developer Review (AI) completed. Status set to `in-progress`. 10 follow-ups created.
- 2026-01-31: E2E smoke verified (`npm run test:e2e`: 18 passed). Status set to `done`.

### Completion Notes
- **Implemented:** `useMode` hook with Zustand store, `ModeProvider` for hydration, and refactored `ModeSwitcher`.
- **Sync Logic:** Store synchronizes `next-themes`, `document.cookie` (1-year expiry, Secure), and `data-mode` attribute.
- **Zero Layout Shift:** `RootLayout` reads cookie to force `data-mode` and `defaultTheme` on server-side render. `ModeProvider` uses ref-guard to sync store synchronously.
- **Testing:** 
  - `src/hooks/useMode.test.ts`: 100% Pass (Vitest).
  - `tests/e2e/mode-persistence.spec.ts`: 100% Pass (Playwright) on Desktop (Chrome/Firefox) and Mobile Chrome. Robust mobile menu interaction logic implemented.
- **Build:** Verified production build `npm run build` passes with no errors.


