# Core User Experience

## Defining Experience
The core experience is defined by the **"Dual-World Switch."** Users do not just browse a portfolio; they enter a specific *atmosphere*. The most critical interaction is the transition between the **Commercial Production Mode** (High-energy, technical, dark) and the **Wedding Studio Mode** (Emotional, gentle, light). This switch must be instantaneous, immersive, and context-preserving, creating the illusion of two distinct companies under one roof.

## Platform Strategy
*   **Primary Platform:** Mobile Web (Safari/Chrome on iOS/Android). The design assets clearly prioritize mobile-first video behaviors (1-column grid).
*   **Secondary Platform:** Desktop Web (Large canvas for full-screen video impact).
*   **Tech Stack:** Next.js 16+ (App Router), Tailwind CSS 4, Framer Motion/Lenis for smooth scrolling, Sanity CMS for content.
*   **Performance Constraint:** Must achieve 100/100 Lighthouse score despite heavy video usage.

## Effortless Interactions
*   **Zero-Click Vibe Shift:** The mode toggle (Global Navigation) instantly swaps theme, fonts, and content without a full page reload or complex menu diving.
*   **Auto-Play on Scroll:** On mobile, videos in the portfolio grid play automatically when they enter the viewport, eliminating the need to "tap to view" for quick scanning.
*   **Hover-to-Reveal (Desktop):** Mouse movement drives content exploration; hovering a project card plays the trailer, creating a dynamic surface that feels alive.

## Critical Success Moments
1.  **The First Toggle:** When a user first clicks "Commercial" or "Wedding," the site must transform *smoothly* (no flash of unstyled content). If this feels clunky, the "Dual-Identity" promise fails.
2.  **The Showreel Hook:** The Hero video must load instantly (LCP < 2.5s). If the showreel buffers, the "premium production house" image is shattered immediately.
3.  **The Admin "Lego" Build:** When the Owner drags a "Hero Section" above a "Grid Section" in Sanity, it must reflect 1:1 on the frontend preview. If the admin experience deviates from the frontend, operational efficiency (15-min landing page goal) is lost.

## Experience Principles
1.  **Motion is Meaning:** Animations are not decoration; they signal context. Fast/Sharp cuts for Commercial, Slow/Fade transitions for Wedding.
2.  **Content First, Chrome Second:** UI elements (Nav, Buttons) recede to let full-bleed video content dominate the screen.
3.  **One Site, Two Souls:** Every shared component (Button, Card, Footer) must have a distinct visual state for both modes.
