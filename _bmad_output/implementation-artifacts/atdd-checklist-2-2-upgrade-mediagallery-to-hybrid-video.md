# ATDD Checklist: Story 2.2 - Upgrade MediaGallery to Hybrid Video

## ATDD Complete - Tests in RED Phase

**Story**: 2.2
**Primary Test Level**: E2E

**Failing Tests Created**:

- E2E tests: 1 tests in `tests/e2e/media-gallery-hybrid.spec.ts`
- API tests: 0 tests
- Component tests: 0 tests

**Supporting Infrastructure**:

- Data factories: 1 (`tests/support/factories/media-gallery.factory.ts`)
- Fixtures: 1 (`tests/support/fixtures/index.ts` - existing)
- Mock requirements: 1 (Sanity `MediaGallery` block mock structure)

**Implementation Checklist**:

- Total tasks: 5
- Estimated effort: 3 hours

**Required data-testid Attributes**: 
- (None strictly required if utilizing `alt` text and ARIA roles, but `data-key` or `data-type` on gallery items recommended for debugging).

**Next Steps for DEV Team**:

1. Run failing tests: `npm run test:e2e -- tests/e2e/media-gallery-hybrid.spec.ts`
2. Review implementation checklist
3. Implement one test at a time (RED → GREEN)
4. Refactor with confidence (tests provide safety net)
5. Share progress in daily standup

**Output File**: `_bmad_output/implementation-artifacts/atdd-checklist-2-2-upgrade-mediagallery-to-hybrid-video.md`

## Implementation Checklist

### Story 2.2 - Hybrid Media Gallery

#### Test: Render Mixed Image and Video Grid

- [ ] **Sanity Schema**: Update `mediaGallery` object to support `mediaType` ('image' | 'video') and `videoFile` field.
- [ ] **Types**: Update `src/types/sanity.ts` to match the new schema.
- [ ] **Sanity Query**: Update `MEDIA_GALLERY` projection in `src/sanity/lib/queries/sections.ts` to fetch video assets.
- [ ] **Frontend - Render Logic**: Update `MediaGallerySection.tsx` to check `mediaType` and render either `<Image>` or `<video>`.
- [ ] **Frontend - Video Attributes**: Ensure `<video>` has `muted`, `autoplay`, `loop`, `playsinline`.
- [ ] **Frontend - Performance**: Implement `useInView` or `IntersectionObserver` to toggle `play()`/`pause()` based on visibility.
- [ ] **Verify**: Run `npm run test:e2e -- tests/e2e/media-gallery-hybrid.spec.ts`.
- [ ] ✅ Test passes (green phase).

## Running Tests

```bash
# Run the specific suite for this story
npm run test:e2e -- tests/e2e/media-gallery-hybrid.spec.ts

# Debug
npm run test:e2e -- tests/e2e/media-gallery-hybrid.spec.ts --debug
```

## Mock Data Structure (Reference)

Ensure your implementation supports this data shape (used in tests):

```typescript
{
  _key: string;
  mediaType: 'image' | 'video'; // New discriminator
  image?: { ... };
  videoFile?: {
    asset: {
      url: string; // Direct file URL
    };
  };
}
```
