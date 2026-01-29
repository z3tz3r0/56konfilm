# Design System Foundation

## 1.1 Design System Choice
**Strategy:** "Headless & Utility-First" Hybrid
*   **Component Logic:** **shadcn/ui** (Headless Radix UI + Tailwind). This provides accessible, functional primitives (Dialogs, Tabs, Carousel) without forcing a visual style.
*   **Styling Engine:** **Tailwind CSS v4** (Utility-first). This facilitates the "Dual Mode" theming via CSS variables.
*   **Motion Engine:** **Framer Motion** + **Lenis** (for smooth scrolling).
*   **Icons:** **Lucide React** (clean, standard) + Custom SVG assets for specialized brand icons.

## Rationale for Selection
1.  **Extreme Theming Flexibility:** We need to switch fonts, spacing, roundness, and colors instantly between "Commercial" and "Wedding" modes. shadcn/ui exposes these as simple CSS variables (`--radius`, `--font-primary`, `--background`), making the "Switch" technically trivial to implement.
2.  **Performance:** Headless libraries ship zero styles by default. We only ship the Tailwind classes we use. This is critical for hitting that 100/100 Lighthouse score.
3.  **Owner-Friendly:** The "Lego-like" admin requirement matches shadcn's component architecture. We can wrap these primitives into "Sanity Blocks" easily.
4.  **Micro-Interaction Ready:** Since we need custom entrance animations and button behaviors, having full control over the DOM (via Radix primitives) allows Framer Motion to intervene without fighting a UI framework's internal styling.

## Implementation Approach
*   **Global Variables:** Define two distinct roots in `globals.css`:
    *   `:root` (Default/Commercial): Dark mode colors, Inter/display fonts, sharp corners.
    *   `.wedding-mode`: Light mode colors, Serif fonts, rounded corners.
*   **Component Architecture:**
    *   Create base components (e.g., `<Button />`) that blindly consume CSS variables.
    *   The "Mode Switcher" simply toggles the `.wedding-mode` class on the `<body>` or outer-most layout wrapper, initiating the global re-theme instantly.

## Customization Strategy
*   **Typography:** Define `font-sans` (Commercial) and `font-serif` (Wedding) tokens.
*   **Animation Tokens:** Define standard durations:
    *   `--duration-fast: 300ms` (Commercial)
    *   `--duration-slow: 800ms` (Wedding)
*   **Z-Index Strategy:** Critical for the full-screen video overlays and sticky navs. We will establish a strict z-index scale to prevent content overlap issues.
