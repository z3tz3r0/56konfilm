# Epic 3: Wedding Mode & Conversion (The "Emotional" Layer)

Implement the "Wedding Mode" context switch, ensuring a complete transformation of mood (fonts, colors, music). Build the intelligent conversion paths (Contact Form routing) for distinct user groups.

## Story 3.1: Wedding Mode Skinning

As a **Visitor**,
I want **the website to change its entire look and feel when I switch to Wedding Mode**,
So that **I feel I am in a romantic, studio environment rather than a raw production house.**

**CRITICAL DESIGN REQUIREMENT:**
- **Strict Fidelity:** Implementations MUST strictly follow the breakdown in `_bmad_output/planning-artifacts/design-assets/`.
- **Reference Assets:** 
  - `public/high-frame/R00_Portfolio_Wedding.png`
  - `_bmad_output/planning-artifacts/design-assets/wedding/common/section-navigation-desktop.png`
- **Flexibility:** Admin must be able to manage this content via Sanity, but the frontend presentation must map 1:1 to the design assets.

**Acceptance Criteria:**

**Given** I click "Wedding Mode"
**When** the transition completes
**Then** the background color should become Cream/Beige (from Design System)
**And** the primary font should switch to a Serif font (e.g., Cormorant)
**And** the accent video loops should change from "Standard/Fast" to "Slow/Cinematic".

**Given** I navigate to inner pages (About, Contact)
**When** I am in Wedding Mode
**Then** the "Skin" must persist correctly.

## Story 3.2: Smart Contact Form Routing

As a **Business Owner**,
I want **commercial inquiries and wedding inquiries to go to different destination emails (or subject lines)**,
So that **my team can maximize response speed and not lose leads.**

**Acceptance Criteria:**

**Given** I am in **Commercial Mode**
**When** I view the contact form
**Then** the header should say "Commercial Inquiry" (or similar)
**And** the submission should tag the lead as "type: commercial".

**Given** I am in **Wedding Mode**
**When** I view the contact form
**Then** the header should say "Tell us your love story"
**And** the fields should include "Wedding Date" and "Venue"
**And** the submission should tag the lead as "type: wedding".

## Story 3.3: Dual-Context Content Strategy (About Us)

As a **Content Admin**,
I want **to manage "About Us" content for both Commercial and Wedding in a single place**,
So that **I don't have to duplicate pages or get confused.**

**Acceptance Criteria:**

**Given** I am editing the "About" page in Sanity
**When** I verify the fields
**Then** I should see tabs or fieldsets for "Commercial Context" and "Wedding Context".

**Given** I visit the `/about` page
**When** I am in **Commercial Mode**
**Then** I should see the "Production House" story and team.

**When** I switch to **Wedding Mode**
**Then** I should see the "Wedding Studio" philosophy and photographer team.

## Story 3.4: Wedding Homepage & Packages

As a **Couple**,
I want **to see wedding packages and testimonials clearly on the homepage**,
So that **I can quickly decide if this studio fits my budget and vibe.**

**Acceptance Criteria:**

**Given** I am on the Wedding Homepage
**When** I scroll to the **Packages Section**
**Then** I should see a clean Pricing Table (as per design assets).

**Given** I view the **Testimonials Section**
**When** I interact with it
**Then** it should be a **Carousel** showing one testimonial at a time
**And** I can navigate left/right to read more reviews.

**Given** I view the **Philosophy Section**
**When** the page loads
**Then** it should present the brand story with elegant Serif typography (as per `section-philosophy-desktop.png`).
