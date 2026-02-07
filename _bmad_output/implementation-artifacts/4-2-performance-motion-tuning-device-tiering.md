# Story 4.2: Performance & Motion Tuning (Device Tiering)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **User on an old mobile phone**,
I want **the site to be usable and not crash**,
so that **I can still view the content even if I don't see heavy parallax effects.**

## Acceptance Criteria

1. **Given** the user is on a low-power device (detected via `navigator.hardwareConcurrency` or `Save-Data`)  
   **When** the site loads  
   **Then** heavy parallax and blur effects are disabled (graceful degradation)  
   **And** video loops do not autoplay when bandwidth/data-saving conditions are constrained.

2. **Given** the user is on a high-end device  
   **When** the site loads  
   **Then** they receive the full cinematic experience targeting smooth 60fps interaction.

## Tasks / Subtasks

- [x] Implement a reusable client capability classifier (AC: 1, 2)
  - [x] Add `src/lib/performance/deviceTier.ts` with a deterministic profile (`low`, `medium`, `high`) using:
  - [x] `navigator.hardwareConcurrency`
  - [x] `navigator.connection?.saveData`
  - [x] `navigator.connection?.effectiveType` when available
  - [x] `window.matchMedia('(prefers-reduced-motion: reduce)')`
  - [x] Keep fallbacks safe for unsupported browsers (Safari may omit Network Information fields).

- [x] Add a shared hook for UI consumption (AC: 1, 2)
  - [x] Create `src/hooks/useDeviceTier.ts` that wraps classifier logic and exposes booleans:
  - [x] `isLowPower`, `allowHeavyMotion`, `allowVideoAutoplay`
  - [x] Ensure no SSR/hydration crash (`typeof window` and client-only logic).

- [x] Apply tiering to transition and animated UI surfaces (AC: 1, 2)
  - [x] Reuse existing reduced-motion path in `src/components/layout/GlobalTransition.tsx` first.
  - [x] In low-power profile, skip heavy transform/blur effects and use simple opacity transitions.
  - [x] Keep current premium motion behavior for high profile.

- [x] Gate video autoplay behavior for low-power/data-saving scenarios (AC: 1)
  - [x] Update `src/components/page/sections/hero/VideoLoop.tsx`:
  - [x] Disable autoplay attempts when profile forbids autoplay; render poster-first experience.
  - [x] Keep muted + playsInline behavior for allowed profiles.
  - [x] Update `src/components/page/sections/media-gallery/VideoItem.tsx`:
  - [x] Respect profile gate before calling `video.play()`.
  - [x] Preserve pause behavior when out of view.

- [x] Validate behavior with focused tests (AC: 1, 2)
  - [x] Add unit tests for classifier/hook with mocked browser capability combinations.
  - [x] Add E2E assertions (mobile emulation + desktop) for:
  - [x] low-power: no autoplay and simplified transitions
  - [x] high-end: autoplay + full motion enabled
  - [x] Keep selectors scoped and deterministic to avoid Playwright flake.

## Dev Notes

### Developer Context Section

- This story is the performance guardrail bridge between completed SEO foundation (Story 4.1) and upcoming CMS hardening stories (4.3/4.4).
- Existing motion and video primitives already exist; implementation must extend them, not replace them:
- `src/components/layout/GlobalTransition.tsx`
- `src/components/page/sections/hero/VideoLoop.tsx`
- `src/components/page/sections/media-gallery/VideoItem.tsx`
- Goal is graceful degradation on constrained devices while preserving brand-level motion on capable hardware.

### Technical Requirements

- Capability checks must be additive and centralized in shared utility/hook modules.
- Do not introduce UA-sniffing heuristics; rely on capability signals (`hardwareConcurrency`, `saveData`, reduced motion).
- Degradation path must be visual-safe: no white flashes, no broken media layout, poster fallback always available.
- Motion degradation must remain consistent with accessibility intent: reduced motion users get lighter transitions by design.
- Maintain existing route and mode behavior (`ModeProvider`, `proxy.ts`) without regression.

### Architecture Compliance

- Respect architecture consistency rules in `_bmad_output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md`.
- Consistency rules override other docs on conflict.
- Keep component-driven mode logic; do not add large layout-level branching.
- Reuse existing primitives and established folder boundaries.
- If any Sanity query/type changes become necessary (unlikely for this story), follow atomic GROQ pattern and update `src/types/sanity.ts` immediately.

### Library Framework Requirements

- Runtime stack in project:
- `next@^16.1.6` (current npm latest: `16.1.6`)
- `motion@^12.29.2` (npm latest observed: `12.33.0`)
- `sanity@^5.7.0` (npm latest observed: `5.8.1`)
- `next-sanity@^12.0.16` (npm latest observed: `12.1.0`)
- Implement this story against currently installed versions; do not force upgrades inside this story.
- If touching Motion APIs, use `motion/react` patterns already in codebase.

### File Structure Requirements

- New logic modules:
- `src/lib/performance/deviceTier.ts`
- `src/hooks/useDeviceTier.ts`
- Existing integration points:
- `src/components/layout/GlobalTransition.tsx`
- `src/components/page/sections/hero/VideoLoop.tsx`
- `src/components/page/sections/media-gallery/VideoItem.tsx`
- Optional test locations:
- `tests/unit/` for capability classifier/hook
- `tests/e2e/` for tiering behavior scenarios

### Testing Requirements

- Unit tests:
- deterministic mapping for capability input -> tier output
- safe fallbacks when APIs are missing
- E2E tests:
- low-power profile disables autoplay-heavy behavior
- high profile keeps full behavior
- no regressions in existing transition and mode-switch flow
- Follow existing Playwright hardening patterns from latest commits (strict locators, typed helpers).

### Previous Story Intelligence

- Story 4.1 already introduced important platform-level updates; use its lessons:
- Keep changes centralized and reusable (`src/lib/...` helpers over per-page ad-hoc logic).
- Avoid server-side cookie mutations in Server Components (fixed earlier in 4.1 context).
- Be aware of current repo baseline issues not introduced by this story:
- `npm run lint` has known ESLint circular-JSON failure.
- `npx tsc --noEmit` has pre-existing Playwright typing errors in unrelated specs.

### Git Intelligence Summary

Recent commits indicate:
- UI transition and motion typing were recently refactored (`abfd5f8`), so preserve those patterns.
- E2E suite was hardened for flake resistance (`d962860`), so new tests should follow the same strict-locator and typed-helper style.
- Sanity/schema strict typing is active (`7896bc5`), so avoid weak typing in newly introduced utility/hook modules.

### Latest Tech Information

- `Save-Data` is a request hint and can be accessed server-side from request headers; browser-side data-saver signal can be read via `navigator.connection.saveData` when supported.
- `navigator.hardwareConcurrency` availability is broad but can be reduced/obfuscated by browser privacy controls; code must tolerate low-confidence values.
- Network Information API support is not universal, especially on Safari; fallback logic is mandatory.
- Motion reduced-motion handling is already first-class in existing code (`useReducedMotion`), and should remain the primary accessibility override.

### Project Context Reference

- No `project-context.md` file was found in repository.
- Context source used:
- `_bmad_output/planning-artifacts/architecture/project-context-analysis.md`
- `_bmad_output/planning-artifacts/architecture/core-architectural-decisions.md`
- `_bmad_output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md`

### References

- `_bmad_output/planning-artifacts/epics/epic-4-cms-mastery-operational-efficiency-admin-power.md#story-42-performance-motion-tuning-device-tiering`
- `_bmad_output/planning-artifacts/prd/7-web-app-specific-requirements.md`
- `_bmad_output/planning-artifacts/prd/8-functional-requirements-capability-contract.md`
- `_bmad_output/planning-artifacts/prd/9-non-functional-requirements-quality-attributes.md`
- `_bmad_output/planning-artifacts/ux-design-specification/responsive-design-accessibility.md`
- `_bmad_output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md`
- `_bmad_output/planning-artifacts/architecture/core-architectural-decisions.md`
- `_bmad_output/implementation-artifacts/4-1-seo-metadata-perfection.md`
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency
- https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData
- https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/effectiveType
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Save-Data
- https://nextjs.org/docs/app/api-reference/functions/headers
- https://motion.dev/docs/react-use-reduced-motion

## Story Completion Status

- Status set to `done`.
- All tasks and subtasks completed.
- Implementation validated via TypeScript compilation, production build, and unit tests (34/34 passed).

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Debug Log References

- Create-story workflow execution with full artifact analysis, git intelligence, and latest tech verification completed on 2026-02-07.
- Implementation session on 2026-02-07: TypeScript ✅, Build ✅, Unit Tests 34/34 ✅

### Completion Notes List

- Story context includes architecture guardrails, anti-regression notes, implementation paths, and testing strategy for device-tiered degradation.
- **IMPLEMENTATION COMPLETED:**
  - Created `deviceTier.ts` utility with deterministic tier classification based on `hardwareConcurrency`, `saveData`, `effectiveType`, and `prefers-reduced-motion`
  - Created `useDeviceTier.ts` hook with SSR-safe client detection exposing `isLowPower`, `allowHeavyMotion`, `allowVideoAutoplay`
  - Updated `GlobalTransition.tsx` to use simplified opacity transitions for low-power devices (no scaleY transforms)
  - Updated `VideoLoop.tsx` to render poster-first fallback and disable autoplay for low-power devices
  - Updated `VideoItem.tsx` to gate `video.play()` based on tier and render placeholder fallback
  - Added 19 unit tests for classifier with mocked browser capability combinations
  - Added E2E test suite for device tiering behavior
  - Review fixes applied:
    - Gated heavy parallax rendering for low-power devices in `ParallaxText`
    - Gated heavy media-gallery hover/motion transforms for low-power devices
    - Hardened autoplay safety on first paint in `useDeviceTier` + `VideoLoop`
    - Added dedicated hook unit tests for `useDeviceTier`
    - Reworked E2E `device-tiering` tests to remove false-positive conditional paths

### File List

- `src/lib/performance/deviceTier.ts` (new)
- `src/hooks/useDeviceTier.ts` (new)
- `src/components/layout/GlobalTransition.tsx` (modified)
- `src/components/page/sections/hero/VideoLoop.tsx` (modified)
- `src/components/page/sections/media-gallery/VideoItem.tsx` (modified)
- `src/components/page/sections/hero/ParallaxText.tsx` (modified)
- `src/components/page/sections/MediaGallerySection.tsx` (modified)
- `tests/unit/deviceTier.test.ts` (new)
- `tests/unit/useDeviceTier.test.ts` (new)
- `tests/e2e/device-tiering.spec.ts` (new)
- `tests/e2e/performance-motion-tiering.spec.ts` (new)
- `tests/support/factories/device-tier.factory.ts` (new)
- `tests/support/fixtures/device-tier.fixture.ts` (new)

## Senior Developer Review (AI)

### Outcome

- Review result: **Approved after fixes**
- High/Medium issues addressed:
  - Heavy-motion degradation gaps closed for parallax and media-gallery surfaces
  - Hook coverage gap closed with dedicated unit tests
  - Initial-load autoplay safety tightened for constrained devices
  - E2E suite hardened to avoid conditional false-positive passes
  - Story File List synchronized with changed source files

### Validation Evidence

- `npx tsc --noEmit` ✅
- `npm run build` ✅
- `npx vitest run tests/unit/deviceTier.test.ts tests/unit/useDeviceTier.test.ts` ✅

## Change Log

- 2026-02-07: Implemented device tier classification system with graceful degradation for low-power devices. Added centralized `deviceTier.ts` utility and `useDeviceTier.ts` hook. Integrated with GlobalTransition (simplified opacity transitions), VideoLoop (poster fallback), and VideoItem (autoplay gating). Added comprehensive unit tests (19 tests) and E2E test suite.
- 2026-02-07: Senior code review fixes applied. Expanded low-power motion gating (ParallaxText + MediaGallerySection), tightened first-paint autoplay safety, added `useDeviceTier` unit tests, and hardened E2E assertions to reduce false positives.
