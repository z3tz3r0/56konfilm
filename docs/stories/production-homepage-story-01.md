# Story 1: Production Hero & Navigation Refresh

## Goal
Deliver the top-of-page experience for the production homepage so that the hero, nav bar, and call-to-action match `R01_home_production.png` while remaining fully CMS-driven.

## Key Inputs
- High frame: `public/high-frame/R01_home_production.png` (hero + top navigation).
- Sanity documents: production homepage `page` document (hero block) and `settings` document (nav items, site title).

## Implementation Outline
1. **Sanity Schema**
   - Add optional fields to `heroSection` (schema) for supporting eyebrow text, hero description, button style, and decorative media flag if needed.
   - Ensure localized fields for title, tagline, and CTA label remain intact.
2. **Types & GROQ**
   - Update `HeroSectionBlock` in `src/types/sanity.ts` with new fields.
   - Extend `pageBySlugQuery` hero selection to pull added fields.
3. **Hero Component**
   - Apply full-height layout, background overlay gradient (`#0b0e14` → transparent) using `SectionShell` `overlayClassName`.
   - Support optional Mac-frame overlay asset (if required) and centered typography with spacing per high frame.
   - Style CTA button (rounded pill, orange background #FF8A1E).
4. **Navigation**
   - Fetch `settings` inside layout or via parallel fetch in hero story; pass into `Navbar`.
   - Update `Navbar` styling (fixed, translucent dark background, white text, active state for “House/Wedding” toggle, menu list alignment).
   - Ensure ModeSwitcher still sets cookies and theme.
5. **Global Styles**
   - Add Tailwind tokens/globals for primary orange, off-white, and background gradients.

## Acceptance Criteria
- [ ] Hero matches layout, typography, spacing, and CTA styling from high frame on desktop and mobile breakpoints.
- [ ] Background image/video renders via Sanity asset with dark overlay; text remains legible.
- [ ] Nav links and logo pull from Sanity settings; sticky nav with correct colors and hover states.
- [ ] ModeSwitcher retains existing functionality; production default uses dark theme.
- [ ] Hero copy entirely editable in Sanity for both languages; Thai fallback confirmed.

## QA & Validation
- Verify production homepage hero in both `th` and `en` locales.
- Smoke-test wedding homepage to ensure nav changes do not break other mode.
- Run `npm run lint` and `npm run check-format` after code changes.
- Manual responsive check at 1440px, 1024px, 768px, 375px.
