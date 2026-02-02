# User Journey Flows (Final Specification)

## Journey 1: The Agency Producer (The "Scout")
**Goal:** Assess quality, vet technical capability, and book 56konfilm for a commercial shoot.
**Context:** Desktop/Laptop. High intent.
**Visual Mapping (Strict):** 
1. `production/landing-page/section-hero-desktop.png` (Full-bleed Video Hero)
2. `production/landing-page/section-who-we-are-desktop.png` (OEM Production House Narrative)
3. `production/landing-page/section-our-service-desktop.png` (High-end craft categories)
4. `production/landing-page/section-process-desktop.png` (How we work: Brief -> Creative -> Production -> Delivery)
5. `production/landing-page/section-previous-work-desktop.png` (Portfolio Grid with Muted Trailers)
6. `production/contact-us/section-contact-form-desktop.png` (Orange 'Let's Discuss' Branding)

```mermaid
graph TD
    A[Landing: Home Production] -->|1. Hero Video Loop| B[Section: Who We Are]
    B -->|2. Observe Brutal Stats| C[Section: What We Offer]
    C -->|3. Click 'Explore our services'| D[Page: Services]
    D -->|4. View Grid Logic| E[Section: Previous Works]
    E -->|5. Hover Grid Item| F[Muted Micro-Trailer Plays]
    F -->|6. Click Project| G[Curtain Wipe: Midnight Black #00040d / Orange #ff7b07 Glow]
    G --> H[Project Detail Page - AUDIO ENABLED]
    H -->|7. Scroll to Bottom| I[Section: Share Your Idea]
    I -->|8. Click 'Let's discuss'| J[Page: Contact Us]
```

## Journey 2: The Modern Couple (The "Vibe Check")
**Goal:** Feel an emotional connection and trust 56konfilm with their wedding day.
**Context:** Emotional Discovery.
**Visual Mapping (Strict):**
1. `wedding/landing-page/section-hero-desktop.png` (Soft Warm Hero)
2. `wedding/landing-page/section-philosophy-desktop.png` ("We take our craft to heart")
3. `wedding/landing-page/section-featured-desktop.png` (Curated Love Stories)
4. `wedding/landing-page/section-packages-desktop.png` (Tiered Pricing: Cherish, Forever, Grand)
5. `wedding/landing-page/section-testimonial-desktop.png` (Embla Carousel)
6. `wedding/common/section-contact-us-desktop.png` (Talk to our team - Mocha Brown Theme)

```mermaid
graph TD
    A[Landing: Home Production] -->|1. Locate 'Wedding' in Nav Switcher| B[Click Mode Switch]
    B -->|2. Pearl Wipe: Ivory White #faf7f2 / Mocha Brown #6d4e3c Edge| C[Landing: Home Wedding]
    C -->|3. Experience 'Philosophy' Section| D[Section: Love Stories We Captured]
    D -->|4. Scroll Featured Stories| E[Section: Featured Wedding Packages]
    E -->|5. Compare Packages| F[Section: Stories From Those Who Chose Us]
    F -->|6. View Testimonial Carousel| G[Click 'Discover More Memories']
    G --> H[Page: Wedding Portfolio]
```

## Journey 3: The Content Admin (The Owner)
**Goal:** Create a new "Featured Commercial" project page in under 15 minutes.
**Behavior:** Flexible Block System based on `production/services/README.md`.

```mermaid
graph TD
    A[Sanity Studio] -->|1. Desk Selection: Production| B[Action: Create New Project]
    B -->|2. Image/Video Block| C{Select Layout}
    C -->|Layout 1| D[Two Column: Text Left / Video Right]
    C -->|Layout 2| E[Full Width Cinematic Hero]
    D & E --> F[Upload 4K Master + Generate Muted Trailer]
    F -->|3. Set Metadata| G[Assign Categories for Filter Badges]
    G -->|4. Publish| H[Live: Site applies sharp corners/Sora font]
```

## Journey 4: The Mobile Commuter (Passive Consumption)
**Goal:** Browsing during commute to see "what's cool."
**Visual Mapping:** `production/landing-page/fullpage-landing-page-mobile.png`

```mermaid
graph TD
    A[Landing: Mobile] -->|1. Swipe Down| B[Who We Are Section]
    B -->|2. Tap Hamburger| C[Glass Nav Overlay Opens]
    C -->|3. Click Portfolio| D[Portfolio Mobile Grid]
    D -->|4. IntersectionObserver Trigger| E[Center Video Plays Muted Loop]
    E -->|5. Double Tap| F[Enter Minimal Fullscreen View]
```

## Journey 5: The "Service Shopper" (Specific Need)
**Goal:** Identify technical capabilities (RED/Drone).
**Visual Mapping:** `production/services/section-all-service-desktop.png`

```mermaid
graph TD
    A[Services Page] -->|1. Hero Section| B[Scroll to 'All Services']
    B -->|2. Observe Rotating Text| C[Text Swaps: 'Music Videos' -> 'Documentaries']
    C -->|3. View 2-Column Responsive Grid| D[Video adjusts height to match text content]
    D -->|4. Find 'Drone/Equipment'| E[Click CTA in Section: 'View Projects']
```

## Journey 6: The "Lost" User (Recovery)
**Goal:** Recover from a broken link/deleted project without bounce.
**Context:** 404 Page.

```mermaid
graph TD
    A[External Link] -->|Link Broken| B[404 Page]
    B -->|Determine Mode Preference| C{User History?}
    C -- Previously Commercial --> D[Show 'Production' 404]
    C -- Previous Wedding --> E[Show 'Wedding' 404]
    C -- Unknown --> D
    D -->|Action| F[Return Home]
```

## Journey 9: The "Slow Connection" Experience
**Goal:** Prevent bounce while video loads.
**Interaction:** Low-Res Poster -> Muted Loop.

```mermaid
graph TD
    A[Enter Portfolio Page] -->|1. DOM Ready| B[Show SVG Placeholder / Low-Res Image]
    B -->|2. JS Script Loads| C[Initialize IntersectionObserver]
    C -->|3. Video Buffers| D[Fade-out Placeholder -> Fade-in Muted Video]
    D -->|4. Playback Stabilized| E[Remove Spinner]
```

## Journey 10: The "Mode Guardian" (Route Protection)
**Goal:** Resolve context mismatches.

```mermaid
graph TD
    A[Url: /production/portfolio/project-x] -->|1. User Swaps to Wedding Mode| B[System Wipe to Ivory White]
    B -->|2. Check Category| C{Is Project 'Wedding'?|
    C -- No --> D[Redirect to /wedding/portfolio with 'Agency' Toast]
    C -- Yes --> E[Stay on Page but apply Serif fonts/Beige colors]
```

## Journey 11: The "Engagement Loop" (Auto-Advance)
**Goal:** Increase time-on-site for Producers.

```mermaid
graph TD
    A[Watching Project Detail Video] -->|End of Video| B[Overlay: 'Next Project' in 5s]
    B -->|User Idle| C[Auto-Trigger Production Curtain Wipe]
    D -->|Manual Scroll| E[Section: Next Project Suggestion]
    E --> F[Next Project Detail Page Start]
```

## Journey 12: The "Testimonial Discovery" (Social Proof)
**Goal:** Validate trust for Wedding couples.
**Visual Mapping:** `wedding/landing-page/section-testimonial-desktop.png`

```mermaid
graph TD
    A[Landing Wedding Section: Testimonial] -->|1. Observe Active Card| B[Read Quote]
    B -->|2. Click Right Arrow| C[Carousel Slides: Embla Engine]
    C -->|3. New Card Focus| D[Update Dot Indicators]
```

## Journey 13: The "Package Selection" (Conversion)
**Goal:** Direct user to the right price point.
**Visual Mapping:** `wedding/landing-page/section-packages-desktop.png`

```mermaid
graph TD
    A[Packages] -->|1. Hero Reveal| B[Compare Tiers: Cherish, Forever, Grand]
    B -->|2. Hover on 'Forever Memories'| C[Apply Subtle Box-Shadow + Scale-up]
    C -->|3. Click 'Start Now'| D[Navigate to Contact with Package QueryParam]
    D --> E[Contact Form Pre-fills: 'Package Interested: Forever Memories']
```

## Journey 15: Behind The Scenes Exploration (Engagement)
**Goal:** See the technical reality and personality of the 56konfilm crew.
**Behavior (per README):** Grid of videos/images.
**Visual Mapping:** `wedding/about-us/section-behind-blog-desktop.png`

```mermaid
graph TD
    A[About Us Page] -->|Scroll to Bottom| B[Section: Behind The Scene]
    B -->|Desktop| C[3-Column Grid: Hover to Play Muted]
    B -->|Mobile| D[1-Column Grid: Autoplay in Viewport]
    C & D --> E[Title and Description rendered UNDER video/image]
```

## Journey Patterns
*   **The "Vibe Check" Gate:** Users almost always start on "Production" (Default). The "Switch" is the gate to the secondary journey.
*   **Video-First Discovery:** Vetting happens via muted hover/scroll loops; deep diving requires explicit action.
*   **Persistent Inquiry:** "Book Now" or "Contact" is always accessible, ensuring decision-to-action is zero clicks away.

## Flow Optimization Principles
1.  **No Dead Ends:** Every Project Detail page loop continues with "Next Project" suggestions.
2.  **Contextual Forms:** Forms detect mode (Wedding vs Commercial) to shuffle fields (Wedding Date vs Agency Name).
