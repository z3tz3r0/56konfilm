# Story 2.2: Upgrade MediaGallery to Hybrid Video

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Visitor**,
I want **to see video loops playing automatically in the gallery grids**,
So that **I can feel the "motion" of the work without clicking play.**

### 1. Introduction
The current `MediaGallerySection` only supports images. Design assets ("Commercial" mode) utilize high-energy video loops in grids to showcase production quality. We need to upgrade the Sanity schema to allow mixed media (Images + Videos) and update the frontend to render them efficiently.

## Acceptance Criteria

1. **Given** the existing `MediaGallerySection` component
   **When** I add an item in Sanity
   **Then** I should be able to select EITHER an **Image** OR a **Video File** (MP4/WebM).
   (*Constraint: Admin must explicitly choose the type per item*).

2. **Given** a gallery item is a **Video**
   **When** it renders on the frontend
   **Then** it should use a native `<video>` tag with attributes: `muted`, `autoplay`, `loop`, `playsinline`.
   **And** it must implement `IntersectionObserver` (or `useInView`) to ONLY play when in the viewport (Performance NFR).

3. **Given** a gallery item is an **Image**
   **When** it renders
   **Then** it should function exactly as before (NextImage optimized).

4. **Given** a hybrid gallery (mix of images and videos)
   **Then** the strict grid layout (e.g., 3-column / 2-column) must be preserved, with videos filling their cells exactly like images (`object-cover`).

## Technical Requirements

### 1. Development Context

- **Files to Modify:**
  - `src/sanity/schemaTypes/objects/module/mediaGallery.ts` (or equivalent object definition).
  - `src/sanity/lib/queries/sections.ts` (Update `MEDIA_GALLERY` projection to fetch video files/URLs).
  - `src/types/sanity.ts` (Update `MediaGallerySection` and `MediaItem` types).
  - `src/components/page/sections/MediaGallerySection.tsx` (Implement the `VideoItem` renderer).

### 2. Architecture Guidelines

- **Media Strategy:** Use **Native HTML5 Video**. Do NOT install external video players (like `react-player` or `mux-player`) for these grid loops.
  - *Reasoning:* These are decorative/ambient loops, not content consumption. Performance is paramount.
- **Performance:**
  - Use `IntersectionObserver` or `framer-motion`'s `useInView` to manage play/pause state.
  - **Requirement:** Videos outside the viewport MUST be paused to save battery/CPU.
- **Styling:**
  - Use `object-cover` and `w-full h-full` to ensure videos behave exactly like the images in the grid.
  - No default video controls.

### 3. Library / Framework Requirements

- **Motion:** Use `motion/react` (specifically `useInView`) if needed for viewport detection, or vanilla `IntersectionObserver` hook.
- **Sanity:** Use `defineField` for the new choice/conditional logic.

### 4. Testing Requirements

- **E2E (Playwright):**
  - Verify that `<video>` tags are present when video data is mocked/provided.
  - Assert existence of `autoplay`, `muted`, `loop`, `playsinline` attributes.
  - (Optional) Verify `paused` property changes based on viewport visibility (if testable reliably).

## Implementation Tips

- **Sanity Schema:** You likely need to change the `items` array to be an array of objects where each object has a type selector (or utilizes `oneOf` if using strict references, though a conditional field inside a generic object is often easier for this simple use case).
  - *Better approach:* Add a `mediaType` select field (`image` | `video`) and conditionally show `image` or `videoFile` fields.
- **Performance:** Create a `<LazyVideo />` component that encapsulates the `ref` and logic.
