# Story 2.0: Design & Performance Hardening (Immediate Fixes)

**Epic:** Epic 2 - The Cinematic Showcase
**Status:** Completed
**Priority:** High (Blocking Quality)

## 1. Goal
Resolve immediate design deviations and performance warnings in the existing codebase to ensure a solid foundation before adding new "Cinematic" features. Specifically targeting the alignment of the `TimelineSection` and console warnings regarding Next.js Images.

## 2. Requirements & Acceptance Criteria

### A. Fix `TimelineSection` Layout (Design Fidelity)
**Context:** The user reported that the `TimelineSection` (Process) `<ol>` list aligns too far to the left/falls off-screen or doesn't match the design.
**Reference Assets:** 
- `_bmad_output/planning-artifacts/design-assets/production/landing-page/section-process-desktop.png`
- `_bmad_output/planning-artifacts/design-assets/production/landing-page/section-process-mobile.png`

**Criteria:**
- [ ] Only the `TimelineSection` is modified to match the visual hierarchy of the design assets.
- [ ] The ordered list `<ol>` is properly contained within the `container` and aligned correctly (likely centered or standard grid alignment, not full-bleed left).
- [ ] Margin/Padding matches the Design System spacing.

### B. Fix Next.js Image Performance Warnings
**Context:** Console is spamming "Image with src ... has 'fill' but is missing 'sizes' prop".
**Affected Components:**
- `CardCollectionSection.tsx` (Icons)
- Likely `HeroSection` or others using `fill`.

**Criteria:**
- [ ] `CardCollectionSection` icons (which seem small, ~48px-96px) should either:
    - NOT use `fill` if they are fixed size (users mentions they are icons). Use `width={96} height={96}` directly if possible.
    - OR provide a correct `sizes` prop (e.g., `48px`) if `fill` is strictly necessary for object-fit control.
- [ ] No "missing sizes" warnings appear in the console during navigation.

## 3. Technical Approach

### TimelineSection
- Review `src/components/page/sections/TimelineSection.tsx`.
- The current implementation likely lacks a wrapper or has erroneous class logic in `ol`.
- Check `container` utility usage.

### CardCollectionSection
- Review `src/components/page/sections/CardCollectionSection.tsx`.
- The code uses `fill` on a div with `h-12 w-12` (48px). This is overkill for `fill` unless the image aspect ratio is wild.
- **Fix:** Switch to intrinsic `width/height` since Sanity image URL is already forcing `w=96&h=96`. Or add `sizes="48px"`.

## 4. Verification Plan
- **Manual:** Check `localhost:3000` console for warnings.
- **Visual:** Verify `TimelineSection` alignment against PNGs.
