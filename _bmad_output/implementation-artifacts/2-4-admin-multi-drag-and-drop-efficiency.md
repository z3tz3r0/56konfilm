# Story 2.4: Admin Multi-Drag-and-Drop Efficiency

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Content Admin**,
I want **to drag and drop multiple media files (Images/Videos) at once into a gallery**,
so that **I don't have to manually create 20 separate items one by one.**

## Acceptance Criteria

1. **Given** I am editing a `MediaGallerySection` in Sanity Studio
   **When** I drag multiple files (Images OR Videos) from my desktop onto the "Items" array input
   **Then** the files should begin uploading in parallel automatically.
   **And** valid `galleryItem` objects should be created for each file once uploaded.

2. **Given** I upload a **JPEG/PNG** image
   **Then** the system creates a `galleryItem` with:
     - `mediaType` = "image"
     - `media.image` = [Reference to uploaded asset]

3. **Given** I upload a **MP4/WebM** video
   **Then** the system creates a `galleryItem` with:
     - `mediaType` = "video"
     - `videoFile` = [Reference to uploaded asset]

4. **Given** the upload is in progress
   **Then** I should see visual feedback (e.g., toasts or a progress indicator) so I know it's working.

5. **Given** the upload finishes
   **Then** the new items should appear at the END of the list.

## Tasks / Subtasks

- [x] **1. Architecture & Setup**
  - [x] Create `src/sanity/components/inputs/MultiUploadArrayInput.tsx`.
  - [x] Register this component in `src/sanity/schemaTypes/sections/mediaGallerySection.ts`.

- [x] **2. Custom Input Implementation**
  - [x] Implement `MultiUploadArrayInput` to wrap default `ArrayOfObjectsInput`.
  - [x] Add `DropZone` or `onPaste` handler.
  - [x] Implement `handleUpload(files)`:
    - [x] Filter valid types (Image/Video).
    - [x] Use `client.assets.upload()` for each file.
    - [x] Construct `galleryItem` object based on MIME type.
    - [x] Use `onChange(setIfMissing([]))` and `onChange(insert([...], 'after', [-1]))`.

- [x] **3. UX Polish**
  - [x] Add Loading State / Toast Notifications using `@sanity/ui` (`useToast`).
  - [x] Handle errors (invalid file types).

- [x] **4. Testing**
  - [x] Manual verification in Sanity Studio (Local Dev).
  - [x] Verify both Image and Video types populate correctly.

## Dev Notes

### Architecture Guidelines
- **Sanity Custom Inputs:**
  - DO NOT modify `node_modules`.
  - Use `import { MemberField, ArrayOfObjectsInputProps } from 'sanity'` (or relevant exports).
  - Use `props.renderDefault(props)` to keep the standard header/footer of the array, but wrap it or inject the dropzone.
  - **State Management:** Use `useState` for upload progress.
  - **Asset Upload:** `useClient({ apiVersion: '2024-01-01' })`.
  - **Patches:** functional updates `items.map(item => insert(item, 'after', [-1]))` might be needed to batch them or insert sequentially.

### Project Structure Notes
- **Component Location:** `src/sanity/components/inputs/` is the correct place for Studio components.
- **Type Safety:** Ensure strict typing for `galleryItem` construction to avoid schema errors.

### References
- [Sanity Asset Upload API](https://www.sanity.io/docs/http-api-assets)
- [Sanity Custom Inputs](https://www.sanity.io/docs/custom-input-widgets)

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### Debug Log References
- Check browser console for upload errors (CORS or size limits).
- Sanity Studio runs on port 3333 or inside Next.js at `/sanity-cms`.

### Completion Notes List
- Implemented `MultiUploadArrayInput` using `@sanity/ui`.
- Integrated drag-and-drop filtering for Images/Videos.
- Registered component in `mediaGallerySection`.
- Added visual feedback (spinner, toast).
- Added paste support and parallel uploads with per-file success/failure handling.
- Added invalid file type warning and ensured new items append to end.
- Added/updated unit tests for upload success and invalid file warning.

### File List
- src/sanity/schemaTypes/sections/mediaGallerySection.ts
- src/sanity/components/inputs/MultiUploadArrayInput.tsx
- src/sanity/components/inputs/MultiUploadArrayInput.test.tsx

### Change Log
- 2026-02-02: Code review fixes applied (parallel uploads, paste support, invalid file warnings, tests updated).
