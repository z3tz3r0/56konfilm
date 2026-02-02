# 2. Core User Experience

## 2.1 Defining Experience
The defining experience is **"Immersive Mode-Switching."** Unlike a standard dark mode toggle, this interaction completely changes the user's emotional context—audio, visual, and content—in a single click. It allows the user to say, "Show me the other side of your personality," and recieve an instant, theatrical response.

## 2.2 User Mental Model
*   **Current Model:** Users are used to "Dark Mode" as a utility toggle (same content, different colors).
*   **New Model:** We are introducing a "Channel Switch" metaphor. Like flipping a TV channel from MTV (Commercial) to Hallmark (Wedding).
*   **Expectation:** Users expect the structure to remain familiar (navigation shouldn't disappear), but the *vibe* to change completely.

## 2.3 Success Criteria
*   **Latency:** The switch must happen in < 150ms. Any lag breaks the illusion.
*   **Continuity:** Scroll position should be preserved (conceptually) where possible, or reset intelligently if the content trees are vastly different.
*   **Discovery:** 100% of new users must interact with the toggle within the first 10 seconds. It is the site's main toy.

## 2.4 Novel UX Patterns
*   **The "Curtain Wipe" Transition:** Instead of a hard cut, we will overlay a mask that wipes across the screen during the theme change. This masks any potential React rendering glitches and adds cinematic flair.
*   **Scroll-Triggered Micro-Video:** Instead of clicking "Play," video elements listen to the scroll position. When a video is center-viewport, it plays. This creates a "Director's Cut" feeling where the user is editing the experience just by scrolling.

## 2.5 Experience Mechanics
**The Switch Mechanism:**
1.  **Initiation:** User clicks the "Weddings / Commercial" Toggle in the Sticky Nav.
2.  **Interaction:** The toggle knob slides to the other side.
3.  **Feedback:**
    *   **Layer 1:** A "Wipe" animation covers the screen (Duration: 300ms).
    *   **Layer 2 (Behind):** The DOM updates (Root class toggled, content re-fetched/re-rendered).
    *   **Layer 3:** The Wipe reveals the new world.
4.  **Completion:** The user lands on the *equivalent* page in the new mode (e.g., Home -> Home), but with the new aesthetic fully applied.
