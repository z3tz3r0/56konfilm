# Epic 2: The Cinematic Showcase (Work Detail Experience)

Upgrade the existing `project` schema and `MediaGallery` components to support "Cinematic" capabilities (Video & Magazine Layouts) found in design assets.


## Story 2.0: Design & Performance Hardening (Immediate Fixes)

As a **User**,
I want **the existing layout and performance issues to be resolved**,
So that **the foundation is solid before we build complex cinematic features.**

**Acceptance Criteria:**

**Given** the `TimelineSection` (Process)
**When** it renders on Desktop and Mobile
**Then** the layout must strictly match `section-process-desktop.png` (not sticking to the left edge).
**And** it should probably use a centered or constrained layout if defined in the design.

**Given** the `CardCollectionSection` (and other components using Next.js Image)
**When** the page loads
**Then** there should be NO console warnings about "missing sizes prop" for images with `fill`.
**And** the `sizes` prop must serve the correct responsive dimensions (e.g., `48px` for icons).

## Story 2.1: Enable Magazine Layouts for Projects

As a **Content Admin**,
I want **to use the Modular Page Builder inside "Project" documents**,
So that **I can create magazine-style layouts for case studies, not just simple text descriptions.**

**CRITICAL DESIGN REQUIREMENT:**
- **Strict Fidelity:** Implementations MUST strictly follow the breakdown in `_bmad_output/planning-artifacts/design-assets/`.
- **Reference Assets:** 
  - `public/high-frame/R01_portfolio_production.png`
  - `_bmad_output/planning-artifacts/design-assets/production/portfolio/fullpage-desktop.png`
- **Flexibility:** While the *default* order matches the design, the Admin MUST have the power to reorder these sections via Sanity Studio.

**Acceptance Criteria:**

**Given** I am in Sanity Studio editing a "Project"
**When** I scroll to the content area
**Then** I should see a `pageBuilder` array (blocks) instead of a simple Rich Text field
**And** I should be able to add `HeroSection`, `MediaGallerySection`, `TwoColumnSection` blocks.

**Given** I visit a Project Detail page `/works/[slug]`
**When** the page renders
**Then** it should map and render each block in the Builder correctly (using existing Section Components).

**And** the "Project" schema must retain crucial metadata (Client, Services, Year) for SEO and listing cards.

## Story 2.2: Upgrade MediaGallery to Hybrid Video

As a **Visitor**,
I want **to see video loops playing automatically in the gallery grids**,
So that **I can feel the "motion" of the work without clicking play.**

**Acceptance Criteria:**

**Given** the existing `MediaGallerySection` component
**When** I add an item in Sanity
**Then** I should be able to select EITHER an Image OR a Video File (MP4).

**Given** a gallery item is a Video
**When** it renders on the frontend
**Then** it should use a `<video>` tag with `muted`, `autoplay`, `loop`, `playsinline`
**And** it must implement `IntersectionObserver` to only play when in viewport (Performance NFR).

**Given** a gallery item is an Image
**When** it renders
**Then** it should function exactly as before (NextImage optimized).

## Story 2.3: Project Navigation & Cinematic Transitions

As a **Visitor**,
I want **to intuitively browse to the next project at the bottom of the page**,
So that **I keep consuming content without hitting a dead end.**

**Acceptance Criteria:**

**Given** I am viewing a Project Detail page
**When** I scroll to the bottom
**Then** I should see a "Next Project" card or area
**And** it should display the correct next project from the SAME mode (Production projects link to Production, Wedding to Wedding).

**Given** I click "Next Project"
**When** the navigation happens
**Then** the `CurtainWipe` transition (from Epic 1) should trigger, masking the page load.

## Story 2.4: Admin Multi-Drag-and-Drop Efficiency

As a **Content Admin**,
I want **to drag and drop multiple media files (Images/Videos) at once into a gallery**,
So that **I don't have to manually create 20 separate items one by one.**

**Acceptance Criteria:**

**Given** I am editing a `MediaGallerySection` in Sanity
**When** I drag 5 images/videos from my desktop onto the array field
**Then** Sanity should upload them all in parallel
**And** automatically create 5 new array items populated with the media assets.

**Note:** May require a Sanity Plugin or Custom Input Component implementation.
