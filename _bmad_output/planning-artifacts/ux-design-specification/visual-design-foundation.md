# Visual Design Foundation

## Color System (Implemented in globals.css)
The system uses a CSS Variable architecture where `:root` defines the "Wedding" (Light) theme and `.dark` defines the "Commercial" (Dark) theme.

**1. Commercial Mode (Dark Class)**
*   **Primary Background:** `Midnight Black (#00040d)` - Deep, rich black.
*   **Secondary Background:** `Espresso (#271b0f)` - Warm dark brown for sections.
*   **Accent:** `Orange (#ff7b07)` - High-energy focus color.
*   **Typography:** `Off-White (#f9f9f9)` / `Light Gray (#c8c8c8)`.

**2. Wedding Mode (Default Root)**
*   **Primary Background:** `Ivory White (#faf7f2)` - Warm, organic paper tone.
*   **Secondary Background:** `Linen Beige (#f3eee8)` - Soft separation.
*   **Primary:** `Mocha Brown (#6d4e3c)` - Used for key UI elements.
*   **Typography:** `Brown (#5b4339)` / `Light Brown (#796b62)`.

## Typography System
*   **Body Font:** `Manrope` (Shared) - Clean, modern sans-serif for readability.
*   **Heading Font (Dynamic):**
    *   **Commercial:** `Sora` - Geometric, technical, wide stance.
    *   **Wedding:** `Cormorant Garamond` - Editorial, elegant, high-contrast serif.

## Spacing & Layout Foundation
*   **Grid:** 4-column (Mobile) / 12-column (Desktop).
*   **Radius:** Defaults to `0.625rem` (10px).
    *   *Recommendation:* Override `--radius` to `0px` in `.dark` mode to enhance the "Brutal" aesthetic required for Commercial mode.

## Accessibility Considerations
*   **Contrast:** The "Orange on Midnight Black" and "Mocha Brown on Ivory" combinations must be verified for AA compliance.
*   **Motion:** `globals.css` imports `tw-animate-css`. We must ensure these classes respect `prefers-reduced-motion`.
