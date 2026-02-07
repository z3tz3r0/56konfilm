# ATDD Checklist: Story 4.1 - SEO & Metadata Perfection

**Story**: 4.1  
**Status**: RED Phase (Failing Tests)  
**Primary Test Level**: E2E  

## Acceptance Criteria Breakdown

| AC # | Acceptance Criterion | Test File | Status |
|------|----------------------|-----------|--------|
| 1 | Dynamic Metadata (Title, Desc, OG Image) on publish | `seo-metadata-perfection.spec.ts` | 🔴 FAIL |
| 2 | Dynamic `/sitemap.xml` listing active routes | `seo-routes.spec.ts` | 🔴 FAIL |
| 3 | Environment-based `robots.txt` rules | `seo-routes.spec.ts` | 🔴 FAIL |
| 4 | `VideoObject` structured data on Project Detail | `seo-metadata-perfection.spec.ts` | 🔴 FAIL |
| 5 | Canonical and Hreflang sync on language switch | `seo-metadata-perfection.spec.ts` | 🔴 FAIL |

## Supporting Infrastructure

- **Data Factory**: `tests/support/factories/seo.factory.ts` (SeoData shape)
- **Sanity Schema**: New `seo` object required in `objects/seo.ts`.

## Required data-testid Attributes

- `language-switcher-en`: English language toggle
- `language-switcher-th`: Thai language toggle
- `mobile-menu-button`: Button to trigger navigations on mobile viewports

## Implementation Checklist

### Phase 1: Sanity Schema & Metadata Utility
- [ ] Create `seo` object schema in Sanity.
- [ ] Implement `src/lib/metadata.ts` shared helper.
- [ ] Update `generateMetadata` in `layout.tsx`, `[slug]/page.tsx`, and `work/[slug]/page.tsx`.

### Phase 2: Technical SEO Routes
- [ ] Implement `src/app/sitemap.ts` using Sanity data.
- [ ] Implement `src/app/robots.ts` with environment logic.

### Phase 3: Structured Data
- [ ] Create `JsonLd` component.
- [ ] Embed `VideoObject` on project detail pages.

## Running Tests

```bash
# Run SEO perfection tests
npx playwright test tests/e2e/seo-metadata-perfection.spec.ts

# Run SEO route tests
npx playwright test tests/e2e/seo-routes.spec.ts
```

## Red-Green-Refactor Workflow

1. **RED**: Verify all above tests fail with `npm run test:e2e`.
2. **GREEN**: Implement minimal code following the checklist.
3. **REFACTOR**: Optimize GROQ queries and ensure metadata cache consistency.
