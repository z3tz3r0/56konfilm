# Story 3: Works Gallery, Brand Grid, CTA Banner & Footer

## Goal
Complete the lower half of the production homepage—previous works gallery, trusted brands grid, CTA banner, and footer—aligned with the high frame and powered by Sanity content.

## Key Inputs
- High frame sections: `public/high-frame/R01_home_production.png` (gallery, brands, CTA banner, footer).
- Sanity `page` document blocks: `mediaGallerySection`, `logoGridSection`, `ctaBannerSection`.
- Sanity `settings` document for footer copy, contact info, social links.

## Implementation Outline
1. **Sanity Schema Updates**
   - `mediaGallerySection`: add optional `ctaLabel`/`ctaLink` fields and allow specifying image aspect ratios/order.
   - `logoGridSection`: ensure array supports at least 12 logos; add optional label/URL per logo if needed.
   - `ctaBannerSection`: extend with localized eyebrow, heading, body, CTA (label/link), background media, overlay color.
   - Update `settings` schema if footer requires additional fields (e.g., quick contact labels, address blocks).
2. **TypeScript & GROQ**
   - Extend relevant block interfaces in `src/types/sanity.ts` and update `pageBySlugQuery` to pull new values.
   - Ensure `settingsQuery` retrieves all footer fields (company title, address, quick contacts, social links).
3. **Component Styling**
   - `MediaGallerySection.tsx`: enforce 3×2 grid on desktop, 2×? on tablet, 1×? on mobile; add hover zoom overlay; center “See More Works” CTA below grid.
   - `LogoGridSection.tsx`: display section heading with orange accent and white subtitle; render logos as light tiles with consistent padding.
   - `CtaBannerSection.tsx`: implement two-column layout with gradient overlay and CTA button.
   - `Footer.tsx`: restructure to match high frame (three columns: company, quick contact, follows). Ensure links styled appropriately.
4. **Global Styles / Utilities**
   - Add button variant for outline/orange CTA used in gallery + banner.
   - Define spacing tokens for section padding and heading letter spacing.

## Acceptance Criteria
- [ ] Previous works gallery displays six items per design, pulling images and labels from Sanity, with CTA linking to portfolio page.
- [ ] Brands section shows 12 logo slots with consistent spacing and heading styling (“BRANDS” in orange, “THAT TRUSTED US” in white).
- [ ] CTA banner matches layout and gradient overlay; copy and CTA editable in Sanity.
- [ ] Footer mirrors high frame layout with company details, quick contact numbers, and social links from Sanity settings.
- [ ] All content localized; Thai fallback verified.
- [ ] Responsive behavior confirmed for tablet and mobile breakpoints.

## QA & Validation
- Populate Sanity with sample gallery images, logos, CTA banner media, and footer info; preview changes across locales.
- Check navigation to “See More Works” and CTA buttons (internal routes or external URLs as configured).
- Smoke-test wedding homepage and other routes to ensure shared components didn’t regress.
- Execute lint/format scripts and manual accessibility pass (focus order, contrast, link semantics).
