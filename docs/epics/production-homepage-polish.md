# Production Homepage Polish – Brownfield Epic

## Epic Summary
- **Goal**: Deliver the production-mode homepage experience matching `public/high-frame/R01_home_production.png`, using Sanity-driven content so editors keep control.
- **Value**: Positions 56KonFilm as a trustworthy production studio with a premium, interactive first impression while keeping the CMS workflow intact.
- **Scope**: Hero through footer sections for the production homepage only (wedding mode handled separately). Includes schema, GROQ, component, styling, and content updates needed for parity with high frame.

## Existing System Context
- **Current functionality**: Next.js App Router serves Sanity `page` documents via `PageBuilder` and section components (`src/components/page/sections`). Navbar/Footer expect data from `settings`.
- **Stack**: React 19, Tailwind CSS 4, Sanity v4 with internationalized arrays, `motion/react`, `next-themes` for mode theming.
- **Integration Points**:
  - Sanity schemas (`src/sanity/schemaTypes/page.ts`, sections, objects, `settings.ts`).
  - GROQ queries in `src/sanity/lib/queries.ts` (`pageBySlugQuery`, `settingsQuery`).
  - TypeScript types in `src/types/sanity.ts`, `src/types/siteSettings.ts`.
  - Mode preferences middleware + cookies (`src/lib/i18nUtils.ts`, `src/middleware.ts`).

## Enhancement Details
- **Changes**: Update section schemas/types/components to support hero overlay, services highlight card, timeline visuals, works gallery, brand grid, CTA banner, and footer layout seen in R01 high frame.
- **Integration**: Extend existing block types and Sanity objects; keep schema changes additive. Ensure GROQ selectors and TS types stay in sync, and `SectionShell`/CTA primitives receive required props.
- **Success Criteria**:
  - Homepage visually matches R01 mock at desktop & mobile breakpoints.
  - All copy/media configurable through Sanity (production mode page + settings document).
  - Localization maintained (Thai fallback, English translation support).
  - Mode switching continues to work, wedding mode unaffected.

## Assumptions & Dependencies
- Sanity dataset already seeded with production homepage document; editors will add localized copy/images.
- High-frame assets represent source of truth for spacing, typography, and colors.
- No new backend services required; all data comes from Sanity.

## Risks & Mitigation
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Schema/query drift causing rendering errors | High | Update schema, types, and GROQ in the same PR; test with Sanity preview. |
| Visual mismatch vs. high frame | Medium | Cross-check after each section; capture screenshots for review. |
| Regression in wedding mode | Medium | Run smoke test on wedding homepage after changes; keep styles mode-aware. |
| Performance regression from heavy media | Low | Optimize with Sanity image URLs (width/quality) and lazy loading. |

## Definition of Done Checklist
- [ ] Schema updates merged and deployed to Sanity.
- [ ] Types and GROQ queries updated.
- [ ] Section components/styling match high frame across breakpoints.
- [ ] Production homepage renders correctly in both Thai and English.
- [ ] Navigation + footer data flow fully from Sanity settings.
- [ ] Local smoke test confirms wedding mode still renders.
- [ ] Documentation (this epic + brownfield architecture doc) reflects latest changes.

## Story Breakdown
1. **Production Hero & Navigation Refresh** – Implement hero, top navigation styling, and CTA per high frame. *(See `docs/stories/production-homepage-story-01.md` for full details.)*
2. **Services Highlight & Timeline Experience** – Extend schemas and components for services grid and timeline visuals. *(See `docs/stories/production-homepage-story-02.md`.)*
3. **Works Gallery, Brand Grid, CTA Banner, Footer** – Finish remaining sections with Sanity-powered content. *(See `docs/stories/production-homepage-story-03.md`.)*

## Handoff Notes for Story Authors
- Follow existing page-builder patterns and leverage `SectionShell`, `CtaGroup`, `CtaButton` for consistency.
- Any schema additions must be additive and localized (use `localizedStringField`/`localizedTextField`).
- When introducing new visuals (e.g., timeline connectors), encapsulate logic inside section components to avoid layout duplication.
- Test production and wedding modes after each story to ensure no regressions.
