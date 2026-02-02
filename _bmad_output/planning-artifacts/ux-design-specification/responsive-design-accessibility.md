# Responsive Design & Accessibility (Strict to Assets & READMEs)

## Responsive Strategy
*   **Mobile-First Video Experience:** The site is optimized for one-handed mobile browsing. Video grids become single-column to maximize visual impact on small screens.
*   **Vertical Balance Rule (2-Column Grid):** Per `production/services/README.md`, in sections with 2-column layouts (Text vs. Media), the media MUST dynamically adjust its height to balance with the text content. VP-aware scaling is required.
*   **Adaptive Media Captions:** Titles and descriptions (provided by Sanity) must always be placed **under** the video/image in the grid, consistent across all breakpoints as per `wedding/about-us/README.md`.
*   **Fluid Typography:** Font sizes use `clamp()` or relative units to ensure headers scale gracefully without breaking the cinematic layout.
*   **Touch Optimization:** All interactive elements have a minimum 44px hit area. Interaction triggers switch from "Hover" (Desktop) to "Scroll-Intersection" (Mobile).

## Breakpoint Strategy
*   **Mobile (< 768px):** Single-column grid. Continuous autoplay (muted) for media hitting the center of the viewport (IntersectionObserver).
*   **Tablet (768px - 1024px):** 2-Column Grid. Transition to simplified motion.
*   **Desktop (> 1024px):** 3-Column Grid (`wedding/about-us/README.md`). Magnetic interactions enabled for Production mode only. Full-screen Hero cover images/videos.
*   **Wide (> 1536px):** Max-width container to maintain line-length legibility.

## Media Interaction & Accessibility
*   **Autoplay Restrictions:** All videos (Hero, Grid, Services) start **MUTED**. 
*   **Center Play Button:** Every `section-hero-*` video must feature a prominent center Play button for intentional user engagement as per `production/services/README.md`.
*   **Interaction Context (Desktop vs. Mobile):** 
    *   **Desktop:** Play muted loop on **Hover** only.
    *   **Mobile:** Play muted loop on **Intersection** only.
*   **Reduced Motion Support:** Users with `prefers-reduced-motion` will skip curtain wipes and magnetic pulls, replacing them with 200ms opacity fades.
*   **Interactive Maps:** Per `wedding/contact-us/README.md`, map sections must use **Google Maps iframes** (or dynamic API) instead of static images to ensure accessibility and interactivity.

## Accessibility Strategy
*   **Compliance:** Targeting **WCAG 2.1 AA level**.
*   **Focus Management:** The "Mode Switcher" is the first focusable element. The "Curtain Wipe" manages focus-trapping during transition.
*   **Semantic Video:** Every video item must have an `aria-label` or `alt` text description provided via Sanity.
*   **RotatingText Screen-Reader Safety:** Ensure the `sr-only` span contains the full sentence for users with visual impairments.

## Implementation & Testing
*   **Carousel Mechanics:** Wedding Testimonials must show **1 item at a time** with navigation arrows and dots as per `wedding/landing-page/README.md`.
*   **Low Power Mode Check:** Ensure high-quality poster images load if autoplay is disabled by the OS.
*   **Performance:** Implement lazy-loading for all media below the fold.
*   **A11y Linting:** Integration of `eslint-plugin-jsx-a11y` is required.
