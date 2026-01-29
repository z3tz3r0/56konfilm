# Design Direction Decision

## Design Directions Explored
We analyzed the provided Design Assets (Figma Exports) which clearly establish two distinct art directions:
1.  **Production Mode:** Dark, cinematic, video-heavy, sharp typography (Sora), high contrast (Orange/Black).
2.  **Wedding Mode:** Light, serif-driven (Cormorant), soft imagery, warm tones (Beige/Brown).

## Chosen Direction: "Cinematic Dualism" (Enhanced)
We are adopting the **existing Figma designs** as the visual source of truth but enhancing them with specific interaction patterns defined by user feedback.

**Interactive Enhancements:**
*   **Production Mode:**
    *   **Magnetic Interaction:** Applied *selectively* to high-value Call-to-Actions (e.g., "Play Reel", "Book Now"). It's too aggressive for every link.
    *   **Logic:** The magnetic pull simulates gravity/force, reinforcing the "Technical/Physical" theme of the production house.
*   **Wedding Mode:**
    *   **Drift/Ripple Interaction:** Instead of magnetic pull, hover states will trigger a gentle "Drift" (slow Y-axis float) or a subtle "Ripple/Glow" effect. This reinforces the "Ethereal/Soft" theme.
    *   **Logic:** No sharp movements. Everything floats.

**Navigation Enhancement:**
*   **Soft-Glass Navigation:**
    *   Instead of a hard 1px border, we will use a **"Gradual Blur" mask** at the edges or a very soft inner shadow/highlight.
    *   The goal is to make the nav bar look like a piece of frosted crystal floating *over* the video, creating separation without rigid lines.

## Design Rationale
*   **Contextual Physics:** The physics of the UI match the physics of the brand.
    *   Commercial = Heavy, Magnetic, Sharp.
    *   Wedding = Light, Floating, Soft.
*   **Premium Detailing:** The "Soft Gradual Blur" on the nav is a hallmark of modern high-end interfaces (like Apple Vision Pro OS), elevating the perceived quality instantly.

## Implementation Approach
*   **Magnetic Component:** We will adapt the ReactBit  component, adding a  prop to turn it off in Wedding Mode, and optimizing the event listeners to only activate within a specific proximity radius to prevent event-handler overload.
*   **Glass Utility:** Create a custom Tailwind utility  that utilizes , , and  (for the soft edge) to handle the nav bar styling.
