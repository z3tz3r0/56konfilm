# Story 3.4: Wedding Homepage & Packages

Status: done

## Story

As a **Couple**,
I want **to see wedding packages and testimonials clearly on the homepage**,
so that **I can quickly decide if this studio fits my budget and vibe.**

## Acceptance Criteria

1. **Given** I am on the Wedding Homepage  
   **When** I scroll to the **Packages Section**  
   **Then** I should see a clean Pricing Table (3 tiers as per design assets).

2. **Given** I view the **Testimonials Section**  
   **When** I interact with it  
   **Then** it should be a **Carousel** showing one testimonial at a time  
   **And** I can navigate left/right to read more reviews.

3. **Given** I view the **Philosophy Section**  
   **When** the page loads  
   **Then** it should present the brand story with elegant Serif typography (as per `section-philosophy-desktop.png`).

4. **Given** all sections are rendered  
   **When** the page loads  
   **Then** all sections should use Wedding mode styling (cream background, serif fonts, slow animations).

5. **Given** the CMS admin is managing packages  
   **When** they view the Sanity Studio  
   **Then** they should be able to add/edit/remove packages with: title, price, currency, features list, CTA.

## Tasks / Subtasks

### Epic Task 1: Sanity Schema - PackagesSection (AC: #1, #5)

- [x] **Create `packageItem.ts` object schema** (`src/sanity/schemaTypes/objects/`)
  - Fields: `title` (string), `price` (number), `currency` (string, default: "THB"), `features` (array of strings), `featured` (boolean for highlight), `cta` (reference to `ctaType`)
  - [x] Add i18n support for `title` using existing `LOCALIZED` pattern

- [x] **Create `packagesSectionType.ts`** (`src/sanity/schemaTypes/sections/`)
  - Fields: `heading` (object: eyebrow, heading, body), `packages` (array of `packageItem`), `background` (string)
  - [x] Define preview to show section heading
  
- [x] **Register in schema index** (`src/sanity/schemaTypes/index.ts`)
  - Import and add `packagesSectionType` and `packageItemType`

### Epic Task 2: Sanity Schema - TestimonialSection (AC: #2, #5)

- [x] **Create `testimonialItem.ts` object schema** (`src/sanity/schemaTypes/objects/`)
  - Fields: `quote` (localized text/block), `authorName` (string), `authorTitle` (string), `authorImage` (image, optional)
  - [x] Use `LOCALIZED` pattern for quote

- [x] **Create `testimonialSectionType.ts`** (`src/sanity/schemaTypes/sections/`)
  - Fields: `heading` (object: eyebrow, heading), `testimonials` (array of `testimonialItem`), `background` (string)
  - [x] Define preview

- [x] **Register in schema index**

### Epic Task 3: Sanity Schema - PhilosophySection (AC: #3)

- [x] **Create `philosophySectionType.ts`** (`src/sanity/schemaTypes/sections/`)
  - Fields: `quote` (localized text - single large quote), `background` (string)
  - [x] Very minimal section - just a large serif quote

- [x] **Register in schema index**

### Epic Task 4: GROQ Queries & Types (AC: #1, #2, #3)

- [x] **Create query fragments** (`src/sanity/lib/queries/sections.ts`)
  - [x] Add `PACKAGES_SECTION` projection
  - [x] Add `TESTIMONIAL_SECTION` projection  
  - [x] Add `PHILOSOPHY_SECTION` projection

- [x] **Update page queries** (`src/sanity/lib/queries.ts`)
  - [x] Add new section projections to `pageBySlugQuery` contentBlocks array

- [x] **Update TypeScript types** (`src/types/sanity.ts`)
  - [x] Add `PackagesSectionBlock`, `TestimonialSectionBlock`, `PhilosophySectionBlock`
  - [x] Add to `PageContentBlock` union type

### Epic Task 5: Frontend - PackagesSection Component (AC: #1, #4)

- [x] **Create `PackagesSection.tsx`** (`src/components/page/sections/`)
  - [x] Use `SectionShell` wrapper
  - [x] Render 3-column grid (1 col on mobile)
  - [x] Highlight featured package with distinct styling (brown background as per design)
  - [x] Use motion/react for entrance animations
  - [x] Implement responsive design matching design assets

### Epic Task 6: Frontend - TestimonialSection Component (AC: #2, #4)

- [x] **Create `TestimonialSection.tsx`** (`src/components/page/sections/`)
  - [x] Use existing Embla Carousel from `src/components/ui/carousel.tsx`
  - [x] Show 1 testimonial at a time
  - [x] Navigation arrows (left/right) with Wedding mode styling (brown circles)
  - [x] Dot indicators for pagination
  - [x] Quote marks styling with large decorative quotes
  - [x] Use `motion/react` for slide transitions

### Epic Task 7: Frontend - PhilosophySection Component (AC: #3, #4)

- [x] **Create `PhilosophySection.tsx`** (`src/components/page/sections/`)
  - [x] Centered serif quote with elegant typography
  - [x] Simple, minimal layout
  - [x] Use Wedding mode CSS variables for styling

### Epic Task 8: PageBuilder Integration (AC: #1, #2, #3)

- [x] **Update `PageBuilder.tsx`**
  - [x] Import new section components
  - [x] Add cases to `renderBlock` switch statement

### Epic Task 9: E2E Testing (AC: #1, #2, #3, #4)

- [x] **Create `tests/e2e/wedding-homepage-packages.spec.ts`**
  - [x] Test PackagesSection renders with correct number of packages
  - [x] Test TestimonialSection carousel navigation (left/right)
  - [x] Test PhilosophySection renders with serif typography
  - [x] Test all sections use Wedding mode styling
  - [x] Use E2E mock data pattern from Story 3-3

## Dev Notes

### Architecture Compliance (CRITICAL)

1. **Naming Patterns:**
   - Components: `PascalCase` (e.g., `PackagesSection.tsx`)
   - Sanity Fields: `camelCase` (e.g., `authorName`, `packageItems`)
   - CSS Variables: `kebab-case` (e.g., `--wedding-accent`)

2. **Dual-Mode Style Logic:**
   - Components MUST use CSS variables from `globals.css`
   - Typography must auto-switch via mode-tied classes (serif fonts in Wedding mode)
   - Do NOT use large `if/else` blocks for layout differences

3. **Atomic GROQ Composition:**
   - Create fragments first, then compose into sections
   - Use existing `LOCALIZED` helper for i18n fields
   - Explicit projections only - no full object fetches (`*`)

4. **AI Agent MUST:**
   - Verify if a Fragment exists before writing new projection logic
   - Update `src/types/sanity.ts` immediately after any query change
   - Follow existing component patterns in `src/components/page/sections/`

### Technical Stack & Libraries

| Library | Version | Usage |
|---------|---------|-------|
| Embla Carousel | via shadcn/ui | Testimonial carousel |
| motion/react | latest | Section entrance animations |
| Tailwind CSS v4 | 4.x | Styling with CSS variables |
| Radix UI | via shadcn | Accessible primitives |

### Design Asset References

| Section | Desktop Asset | Mobile Asset |
|---------|--------------|--------------|
| Packages | `wedding/landing-page/section-packages-desktop.png` | `wedding/landing-page/section-package-mobile.png` |
| Testimonial | `wedding/landing-page/section-testimonial-desktop.png` | `wedding/landing-page/section-testimonial-mobile.png` |
| Philosophy | `wedding/landing-page/section-philosophy-desktop.png` | N/A (same on mobile) |

### Design Specifications from Assets

**Packages Section:**
- 3 pricing tiers: Cherish Starter (2,000 THB), Forever Memories (5,000 THB), Grand Symphony (9,000 THB)
- Featured tier has brown/beige background, others white
- Each package: Title (serif), Price (large number + currency), Feature list (5 items), CTA button
- CTA: "Start Now" button with outlined style

**Testimonial Section:**
- Heading: "STORIES FROM THOSE WHO CHOSE US" (all caps, spacing)
- Quote card: cream/beige background, large decorative quote marks
- Quote text: serif font, multiple lines
- Author: Name (bold) + Title/Company
- Navigation: Brown circular buttons with arrows, dot indicators

**Philosophy Section:**
- Single centered quote in elegant serif
- Example: "We take our craft to heart as it's truly valuable in life"
- Minimal styling, focus on typography

### File Structure Notes

```
src/
├── sanity/schemaTypes/
│   ├── objects/
│   │   ├── packageItem.ts        # NEW
│   │   └── testimonialItem.ts    # NEW
│   ├── sections/
│   │   ├── packagesSection.ts    # NEW
│   │   ├── testimonialSection.ts # NEW
│   │   └── philosophySection.ts  # NEW
│   └── index.ts                  # UPDATE
├── components/page/sections/
│   ├── PackagesSection.tsx       # NEW
│   ├── TestimonialSection.tsx    # NEW
│   └── PhilosophySection.tsx     # NEW
└── types/sanity.ts               # UPDATE
```

### Previous Story Intelligence (from 3-3)

1. **GROQ mode filters:** Handle `siteMode` as string, include `both` option
2. **E2E mock pattern:** Use `?e2e=1` query param for deterministic test data
3. **Content signature:** Add `data-content-signature` for E2E verification
4. **Transition handling:** Global transition system handles mode switches smoothly

### References

- [Source: `_bmad_output/planning-artifacts/epics/epic-3-wedding-mode-conversion-the-emotional-layer.md#Story 3.4`]
- [Source: `_bmad_output/planning-artifacts/design-assets/wedding/landing-page/README.md`]
- [Source: `_bmad_output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md`]
- [Source: `_bmad_output/planning-artifacts/ux-design-specification/design-system-foundation.md`]
- [Source: `src/components/ui/carousel.tsx` - Existing Embla carousel implementation]
- [Source: `src/components/page/sections/CardCollectionSection.tsx` - Pattern reference]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5)

### Debug Log References

### Implementation Plan

- Implement new Sanity object/section schemas for packages, testimonials, and philosophy.
- Wire GROQ projections and TypeScript types for new section blocks.
- Build three Wedding mode section components and integrate into PageBuilder.
- Validate E2E coverage for packages, testimonials carousel, philosophy typography, and styling.

### Completion Notes List

- Implemented packages, testimonials, and philosophy Sanity schemas; registered section types and enabled them in Page content blocks.
- Added GROQ projections, TypeScript block types, and PageBuilder integration for new wedding sections.
- Built Packages/Testimonial/Philosophy section components with wedding styling, animations, and required data-testid hooks.
- Added E2E mock for `/en/wedding-home?e2e=1` and updated wedding homepage E2E test to target it.
- Tests: `npx playwright test tests/e2e/wedding-homepage-packages.spec.ts` ✅. `npx vitest run` ❌ (existing failures in `src/sanity/components/inputs/MultiUploadArrayInput.test.tsx` and Playwright specs being picked up by Vitest).
- Senior review fixes applied: restricted `?e2e=1` mock data to test runtime only, removed forced dynamic rendering, enforced package CTA validation, and extended Wedding styling test to include Philosophy section background.

### File List

- `src/app/[lang]/[slug]/page.tsx`
- `src/app/globals.css`
- `src/components/page/PageBuilder.tsx`
- `src/components/page/SectionShell.tsx`
- `src/components/page/sections/PackagesSection.tsx`
- `src/components/page/sections/PhilosophySection.tsx`
- `src/components/page/sections/TestimonialSection.tsx`
- `src/components/providers/ModeProvider.tsx`
- `src/sanity/lib/queries.ts`
- `src/sanity/lib/queries/sections.ts`
- `src/sanity/schemaTypes/index.ts`
- `src/sanity/schemaTypes/objects/packageItem.ts`
- `src/sanity/schemaTypes/objects/testimonialItem.ts`
- `src/sanity/schemaTypes/page.ts`
- `src/sanity/schemaTypes/sections/packagesSection.ts`
- `src/sanity/schemaTypes/sections/philosophySection.ts`
- `src/sanity/schemaTypes/sections/testimonialSection.ts`
- `src/types/sanity.ts`
- `tests/e2e/wedding-homepage-packages.spec.ts`
- `tests/support/fixtures/index.ts`

### Senior Developer Review (AI)

- Findings resolved on 2026-02-06:
  - Fixed production exposure of mock payload route via `?e2e=1` by gating to test runtime only.
  - Removed global `force-dynamic` on slug route to restore cache-friendly behavior.
  - Enforced `cta` as required in `packageItem` schema to align with AC #5.
  - Extended E2E Wedding palette assertion to include Philosophy section background.
  - Updated File List to reflect additional related files touched during implementation window.

### Change Log

- Implemented Wedding Homepage packages/testimonials/philosophy sections with schemas, queries, types, components, and E2E coverage. (Date: 2026-02-05)
- Applied adversarial senior code-review fixes and closed HIGH/MEDIUM findings. (Date: 2026-02-06)
