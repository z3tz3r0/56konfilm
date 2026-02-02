# Component Strategy (Design-Asset Aligned)

## Design System Components (shadcn/ui Strategy)
We will leverage `shadcn/ui` *only* for complex accessible primitives. We will strictly strip their default styles and apply our `Dual-Mode` classes. All shadcn components must accept a `mode` prop or read from the `ModeProvider`.

**Core Primitives to Install:**
1.  **Dialog/Sheet (Radix):** For the full-screen glassmorphism overlay menu on mobile.
2.  **Accordion:** For the FAQ or Equipment sections in "Services" and "Packages".
3.  **Carousel (Embla):** For the "Wedding Testimonials" section (`section-testimonial-desktop.png`). Must support touch swipe and dot indicators.
4.  **Form/Input:** High-performance validation for the branded contact forms.

## Signature Custom Components (The "Soul")
These components define the 56konfilm duality and are NOT standard shadcn items.

### 1. CurtainWipe (Navigation Interaction)
*   **Purpose:** Global state toggle and page transition overlay.
*   **Behavior:** A physical sliding "pill" switch triggers a full-screen curtain wipe.
*   **Production:** `bg-[#00040d]` (Midnight Black) with a 2px `#ff7b07` (Orange Glow) leading edge.
*   **Wedding:** `bg-[#faf7f2]` (Ivory White) with a 1px `#6d4e3c` (Mocha Brown) solid leading edge.
*   **Implementation:** `framer-motion` `AnimatePresence`.

### 2. MagneticButton (Interactive)
*   **Purpose:** The primary CTA for "Play Reel", "Let's Discuss", and "Book Now".
*   **Behavior (Production):** Container physically moves towards the cursor within a 50px radius using spring physics.
*   **Behavior (Wedding):** Magnetism DISABLED. Replaces with a gentle `scale-105` + `shadow-lg` transition via a mocha-brown theme.

### 3. VideoGridItem (Media Rendering)
*   **Purpose:** The core building block of the portfolio and gallery.
*   **Behavior (Desktop):** Static high-res cover image -> Plays **MUTED** video loop on Hover (No UI controls).
*   **Behavior (Mobile):** Plays **MUTED** loop automatically when in center of viewport (IntersectionObserver).
*   **Loading:** Implement lazy-loading and the "Blur-up" poster image strategy to prevent buffering gaps.

### 4. RotatingText (Typography)
*   **Purpose:** Cinematic swapping for category headings (e.g., `section-all-service-desktop.png`).
*   **Implementation:** Custom `motion/react` stack as provided in `production/services/README.md`.
*   **Defaults:** `rotationInterval=2000`, `splitBy='characters'`, `staggerDuration=0.05`.

## Component Implementation Strategy
1.  **"Unstyled" First:** Install shadcn components and manually strip Tailwind classes to prevent fighting defaults. 
2.  **Global "Mode" Context:** Wrap the application in a `ModeProvider` exposing an `isCommercial` boolean to drive style AND logic.
3.  **Z-Index Registry:** Define a strict map in `tailwind.config` (e.g., `z-nav: 50`, `z-wipe: 100`) to ensure transitions sit atop all content.
4.  **Flexible Content Blocks (Sanity):**
    *   **SplitBlock:** 2-column layout where Media height dynamically balances with Text length (per `production/services/README.md`).
    *   **BehindTheScenesBlock:** 3-column grid (Desktop) / 1-column (Mobile) with captions **under** the media.

## Implementation Roadmap
*   **Phase 1 (Core Foundations):** `ModeProvider`, `DualModeSwitcher`, `Layout` (with CurtainWipe), `MagneticButton`.
*   **Phase 2 (Media Engine):** `VideoGridItem`, `IntersectionObserver` hook, Lazy-loading logic.
*   **Phase 3 (Structure):** `Nav` (Glass), `Footer` (Dual-mode styling), `Hero` (Center Play Button).
*   **Phase 4 (Content Modules):** `Carousel` (Testimonials), `Accordion` (FAQ), `RotatingText` (Services).
