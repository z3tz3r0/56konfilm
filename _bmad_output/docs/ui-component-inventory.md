# UI Component Inventory

This document catalogs the React components used in the 56konfilm frontend.

## Core Layout

- **Navbar**: Top navigation with locale and mode switching.
- **Footer**: Site footer with contact info and social links.
- **PageBuilder**: The main orchestrator that renders Sanity sections dynamically.
- **SectionShell**: A wrapper component to maintain consistent spacing and layout for all sections.

## Sections

These components correspond directly to Sanity schema types:
- **HeroSection**: Cinematic hero with text overlay.
- **TwoColumnSection**: Flexible 50/50 layout for narrative content.
- **CardCollectionSection**: Multi-card layout for services or highlights.
- **TimelineSection**: Vertical or horizontal step-based storytelling.
- **MediaGallerySection**: High-quality visual showcase.
- **LogoGridSection**: Clean grid for partner/client recognition.
- **CtaBannerSection**: Bold call-to-action block.

## UI Elements (shadcn/ui based)

- **Button**: Standard interactive button.
- **Sheet**: Slide-out panel for mobile navigation.
- **Sonner**: Toast notifications for feedback (e.g., login success).
- **Tabs**: Tabbed content switching.
- **ModeSwitcher**: Toggle for 'Production' and 'Wedding' site modes.

## Patterns

- **Localization**: Components use the `lang` cookie to select content from localized Sanity arrays.
- **Server Components**: Most page and section components are Next.js Server Components for performance.
- **Frammer Motion**: Subtle animations for entrance and interaction (via `motion`).
