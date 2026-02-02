# ATDD Checklist: Story 1.3 - Commercial Homepage Brutal Loop

**Story**: 1-3-commercial-homepage-brutal-loop
**Primary Test Level**: E2E

## Acceptance Criteria Breakdown

1. **Hero Video Loop**: Full-screen, muted, playsinline, autoplays.
2. **Parallax Typography**: "WE SHOOT HARD" text overlaid.
3. **Scroll Interactions**: Velocity-based skew (Test coverage: Visual/Structure presence).
4. **Bilingual Support**: Thai text handling.

## ATDD Artifacts Created

### Failing Tests (RED Phase)
- **E2E**: `tests/e2e/commercial-hero.spec.ts` (3 tests)

### Data Infrastructure
- **Factories**: `tests/support/factories/hero.factory.ts` (Sanity Hero Mock)
- **Fixtures**: Using existing `setMode` in `tests/support/fixtures/index.ts`

### Mock Requirements
- **Sanity API**: The test currently runs against the app, but a factory is provided for future network mocking if Sanity content is not available or needs to be deterministic.

## Required data-testid Attributes

To make tests robust, please add these attributes to the implementation:
- `video` element (or container): `data-testid="hero-video"`
- Parallax Text container: `data-testid="hero-parallax-text"`

## Implementation Checklist

### Core Hero Component
- [ ] Create/Update `src/components/page/sections/HeroSection.tsx`
- [ ] Implement `VideoLoop` component with `<video>` tag
- [ ] Add attributes: `muted`, `loop`, `playsinline`, `autoplay`, `poster`
- [ ] Ensure `data-testid="hero-video"` is present on the video element
- [ ] 🔴 Run test: `npm run test:e2e -- commercial-hero.spec.ts` (Should pass video check)

### Parallax Typography
- [ ] Implement `ParallaxText` component using `motion/react`
- [ ] Add "WE SHOOT HARD" text (sourced from Sanity or default)
- [ ] Ensure `data-testid="hero-parallax-text"` is on the text container
- [ ] 🔴 Run test: `npm run test:e2e -- commercial-hero.spec.ts` (Should pass text check)

### Integration
- [ ] Verify `ModeProvider` correctly renders this in Commercial mode
- [ ] Verify Thai text rendering (sanity check)

## Red-Green-Refactor Workflow

**RED Phase** (Complete):
- ✅ Tests created and confirmed failing.
- ✅ Factories ready.

**GREEN Phase** (You):
1. Implement minimal code for Video.
2. Verify: `npm run test:e2e -- commercial-hero.spec.ts`
3. Implement minimal code for Text.
4. Verify: `npm run test:e2e -- commercial-hero.spec.ts`

**REFACTOR Phase** (You):
1. Optimize motion performance (will-change).
2. Clean up code.

## Execution Commands

```bash
# Run failing tests
npm run test:e2e -- commercial-hero.spec.ts
```
