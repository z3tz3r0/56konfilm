# UX Consistency Patterns (Verified against Design Assets)

## Button Hierarchy (Strict to Design)

| Level | Production Mode (Commercial) | Wedding Studio Mode |
| :--- | :--- | :--- |
| **Primary (CTA)** | **MagneticButton**: Sharp corners, Orange bg (#ff7b07), high-energy pull. | **SoftButton**: Rounded corners (Pill), Mocha/Ivory bg, gentle scale. |
| **Secondary** | Ghost Button: 1px Sharp border, "Invert" hover effect. | Soft Ghost: 1px Light border (#e5e5e5), "Fill" hover effect. |
| **Link/Text** | Underline expands from center, bold Sora font. | Underline slides from left, italicized Cormorant Garamond. |

## Feedback Patterns
*   **The Wipe (Global Transition):** 
    *   **Production:** Midnight Black (#00040d) with 2px Orange (#ff7b07) Glow Edge. Top-to-Bottom. (400ms duration).
    *   **Wedding:** Ivory White (#faf7f2) with 1px Mocha Brown (#6d4e3c) Edge. Top-to-Bottom. (400ms duration).
*   **Micro-Video (Muted Only):** 
    *   Hovering over portfolio grid items (Desktop) or viewport intersection (Mobile) plays a muted loop.
    *   **NO UI Controls:** No seek bar, no play/pause, no volume. Strictly decorative/narrative.
*   **Toasts/Alerts:** Minimal at the bottom-right.
    *   *Commercial:* Bordered, monospace font, sharp corners.
    *   *Wedding:* Shadowed, serif font, rounded corners.

## Form Patterns (Strict to Assets)
*   **Production Form:** High-contrast Orange/White headers ("Share Your Idea with Us"). Sharp inputs.
*   **Wedding Form:** Warm mocha icons, soft borderless inputs, serif headers ("We're Here for Your Once-in-a-Lifetime Day").
*   **Floating Labels:** Used for both modes to keep the interface minimal (Chrome-second).
*   **Validation:** Inline errors with a subtle vibrate/shake animation in Commercial mode, and a soft fade-in red text in Wedding mode.
*   **Smart Context:** The contact form automatically shuffles its fields based on the active mode (e.g., asking for "Brand Name" vs. "Wedding Venue").

## Navigation Patterns
*   **The Glass Nav:** A persistent header with `backdrop-filter: blur(40px)`. No hard bottom border; gradual mask to blend with video content.
*   **Mode Toggle:** Physical switch styling in the Nav to toggle between 'Production' and 'Wedding' modes. Persistent via `localStorage`.
*   **Mobile Drawer:** A full-screen overlay (Radix Sheet / Dialog) using site-wide cinematic transitions.

## Interaction Consistency (The "Alive" Rule)
*   **No Dead Clicks:** Every interactive element MUST trigger a Framer Motion response (Spring/Ease) within 150ms.
*   **Rotating Text:** Used in Production mode (e.g., Services section) for cinematic swapping of categories (Music Videos, TVC, etc.) using the `RotatingText` component.
*   **Entrance Choreography:** All sections use a staggered reveal. Headers first, then media, then text elements.
