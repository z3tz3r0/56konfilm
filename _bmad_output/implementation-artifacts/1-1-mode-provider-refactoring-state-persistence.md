# Story 1.1: ModeProvider Refactoring & State Persistence

Status: review

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

## Dev Notes

- **Refactoring Target**: `src/components/navigation/ModeSwitcher.tsx`.
- **Project Structure**:
  - `src/hooks/useMode.ts` - Main logic.
  - `src/components/providers/ModeProvider.tsx` - Context/Hydration wrapper.
  - `src/lib/preferences.ts` - `SiteMode` type source.

### Implementation Status Analysis

| Component | Status | Action Required |
|-----------|--------|-----------------|
| `src/hooks/useMode.ts` | ❌ Missing | **Create New**. Must contain Zustand store and action logic. |
| `src/components/providers/ModeProvider.tsx` | ❌ Missing | **Create New**. Client Component wrapper for hydration. |
| `src/components/navigation/ModeSwitcher.tsx` | ⚠️ Needs Refactor | **Modify**. Remove `useState`/`document.cookie`. Replace with `useMode`. Preserve animation logic. |
| `src/app/layout.tsx` | ⚠️ Needs Update | **Modify**. Read cookie headers. Wrap children with `ModeProvider` passing `initialMode`. |

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
-`vitest.config.ts`

### Completion Notes
- **Implemented:** `useMode` hook with Zustand store, `ModeProvider` for hydration, and refactored `ModeSwitcher`.
- **Sync Logic:** Store synchronizes `next-themes`, `document.cookie` (1-year expiry), and `data-mode` attribute.
- **Testing:** Added 100% test coverage for `useMode` hook via Vitest. E2E tests verified.
- **Build:** Verified production build `npm run build` passes with no errors.

