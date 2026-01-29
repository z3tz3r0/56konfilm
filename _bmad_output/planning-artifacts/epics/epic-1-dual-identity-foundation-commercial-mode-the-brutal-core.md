# Epic 1: Dual-Identity Foundation & Commercial Mode (The "Brutal" Core)

Establish the system's core "Dual-Mode" architecture and execute the high-performance Commercial (Production) experience. Focus on refactoring existing foundational code for maintainability and completing the "Brutal" interaction set.

## Story 1.1: ModeProvider Refactoring & State Persistence

As a **User**,
I want **my selected viewing mode (Commercial/Wedding) to be remembered**,
So that **I don't have to switch modes every time I refresh or return to the site.**

**Acceptance Criteria:**

**Given** the user lands on the site for the first time
**When** the site loads
**Then** the default mode should be "Commercial"
**And** a cookie named `site-mode` should be set.

**Given** the user switches the mode to "Wedding"
**When** they refresh the page OR open a new tab
**Then** the site should initialize in "Wedding" mode immediately (no flash of wrong content)
**And** the `localstorage` and `cookie` should both reflect "wedding".

**Given** the developer is inspecting the code
**When** they check `ModeProvider`
**Then** it should use Zustand store synchronized with Cookies for SSR compatibility.

## Story 1.2: Cinematic Layout & Global Transitions

As a **User**,
I want **smooth visual transitions when navigating or switching modes**,
So that **the experience feels premium and continuous, not jarring.**

**Acceptance Criteria:**

**Given** the user is on any page
**When** they click the "Mode Switch" button
**Then** a full-screen "Curtain Wipe" animation (black/white) should play
**And** the background color and font family variables must update dynamically (e.g., Sans-serif -> Serif).

**Given** the transition is happening
**When** the new content loads
**Then** there must be zero layout shift (CLS < 0.1)
**And** the animation must hold at 60fps.

## Story 1.3: Commercial Homepage Brutal Loop

As a **Commercial Client (Agency)**,
I want **to see a high-energy showreel immediately upon landing**,
So that **I am instantly impressed by the "Brutal" aesthetic and production quality.**

**Acceptance Criteria:**

**Given** the user is in "Commercial Mode"
**When** they view the Homepage Hero section
**Then** a full-screen video loop should play automatically (Muted, Playsinline)
**And** the text "WE SHOOT HARD" (or similar) should scroll/parallax over the video.

**Given** the user scrolls down
**When** they scrub through the page
**Then** the typography complexity should react to scroll position (Velocity-based skew or movement).

## Story 1.4: Bilingual SEO Foundation for Commercial

As a **Search Engine (Google)**,
I want **to clearly understand which content is Thai vs English**,
So that **I can serve the correct language version to the correct user.**

**Acceptance Criteria:**

**Given** the site has English and Thai content
**When** the HTML is rendered
**Then** the `<html>` tag must have the correct `lang` attribute (e.g., `en` or `th`)
**And** the `<head>` must contain `<link rel="alternate" hreflang="..." />` tags for the corresponding page in the other language.

**Given** the user switches language via the UI
**When** the URL changes (e.g., `/th/work` vs `/work`)
**Then** the content should update instantly without a full page reload if possible (Soft Navigation).
