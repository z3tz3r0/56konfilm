# UX Pattern Analysis & Inspiration

## Inspiring Products & Patterns Analysis
*   **Selective Reference Strategy:** We will only look to external products for *missing* layouts or specifically for **complex micro-interactions**. We already have strong static designs; the goal is to breathe life into them, not replace them.
*   **The "Alive" Interface:** Every component, no matter how small, must provide feedback. The interface shouldn't just be a static page; it should respond to presence and intent.

## Transferable UX Patterns (Micro-Interaction Focus)
*   **Entrance Choreography:**
    *   **Images & Videos:** Never just "appear." Use scroll-triggered entrance animations (e.g., subtle scale-up, reveal from mask, parallax movement relative to scroll speed).
    *   **Text:** Staggered line-by-line reveal or character shuffle effect (scramble text) for headers to feel technical/cinematic.
*   **Smart Button Feedback:**
    *   **Beyond Scale:** Don't just scale up/down.
    *   **Icon Animation:** If a button has an arrow, the arrow should slide out right and reappear from left on hover. If it’s a "Play" button, it might morph into a "Pause" shape or pulse subtly.
    *   **Border/Fill Flow:** Borders might draw themselves around the button, or background fills might sweep in from a corner.
*   **Parallax & Depth:**
    *   Use `lenis` and `framer-motion` to create velocity differences. Background elements move slower than foreground content, creating a subtle 3D feeling while scrolling.

## Anti-Patterns to Avoid
*   **The "Dead" Click:** Clicking or tapping something without immediate visual ripple or state change.
*   **Slow-Mo Feedback:** Animations that are too slow (>0.4s for UI feedback) make the site feel heavy. Feedback must be snappy (approx 0.2s - 0.3s).
*   **Over-Animation (The "Jelly" Effect):** Avoid erratic bouncing or spring physics that feel childish. The motion must be "Cinematic" (smooth easing), not "Cartoonish."

## Design Inspiration Strategy
*   **Adopt:** A policy of **"No Static Elements."** Even a simple text link must have a hover state (e.g., underline expands from center).
*   **Adapt:** Parallax scrolling patterns from high-end editorials, applied to our specific "Dual Mode" grids.
*   **Strategy:** Use animation to provide **Texture** and **Feedback**, not just distraction. It must feel "Expensive" — purposeful, measured, and perfectly timed.
