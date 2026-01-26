# Story 2: Services Highlight & Timeline Experience

## Goal
Implement the “What We Offer” services tiles and the “How We Work” timeline so they reflect the production high frame and remain fully manageable through Sanity.

## Key Inputs
- High frame sections: `public/high-frame/R01_home_production.png` (services row + timeline).
- Sanity `page` document content blocks (`cardCollectionSection`, `timelineSection`).

## Implementation Outline
1. **Sanity Schema Updates**
   - `cardCollectionSection`:
     - Add `variant` on the block (e.g., `featuredCardIndex`) or allow individual card `variant` `'featured'` to style the orange tile.
     - Ensure cards expose localized titles, body, CTA label.
   - `timelineSection`:
     - Add fields for step icons, step numbers, and optional accent color.
     - Provide localized headings, descriptions per step.
2. **TypeScript & GROQ**
   - Extend `CardCollectionSectionBlock` and related types in `src/types/sanity.ts`.
   - Update `pageBySlugQuery` selectors for new fields (cards variant, timeline icon/order strings).
3. **Component Styling**
   - `CardCollectionSection.tsx`:
     - Render featured card with orange background (#FF8A1E), white text, and CTA button.
     - Style other cards with light surfaces, uppercase headings, center alignment.
   - `TimelineSection.tsx`:
     - Build vertical progress line with step connectors, alternating left-right cards on desktop, stacked on mobile.
     - Use translucent glass panels, include icon placeholders, highlight step numbers.
4. **Utility Enhancements**
   - Add helper classes (e.g., uppercase label, letter spacing) to `globals.css`.

## Acceptance Criteria
- [ ] Services row renders four tiles matching the high frame; first tile styled as featured.
- [ ] Each tile’s content comes from Sanity and supports localization.
- [ ] “Explore our services” CTA wired to the correct page (internal or external as configured).
- [ ] Timeline shows four steps with vertical connector, alternating cards, icons, and numbers.
- [ ] Timeline content is editable in Sanity and respects locale selection.
- [ ] Responsive behavior matches design (tiles wrap on tablet/mobile, timeline stacks vertically on <1024px).

## QA & Validation
- Confirm schema changes deployed/migrated in Sanity and document updated blocks.
- Test both production and wedding homepages to ensure card/timeline components remain compatible.
- Accessibility: verify contrast of orange tile and timeline text on backgrounds; ensure focus states for CTA buttons.
- Run lint/format scripts after implementation.
