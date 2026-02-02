---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad_output/planning-artifacts/prd/index.md
  - _bmad_output/planning-artifacts/architecture/index.md
  - _bmad_output/planning-artifacts/ux-design-specification/index.md
  - _bmad_output/planning-artifacts/design-assets/index.md
---

# 56konfilm - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for 56konfilm, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Core Experience & Modes:**
*   **FR-1 [Implemented]:** Visitor can toggle "Commercial/Wedding" modes via global **Mode Switcher**.
*   **FR-2 [Implemented]:** System persists **Mode Preference** (Persistent Storage/Cookies) across sessions.
*   **FR-4 [Implemented]:** System handles **Seamless Page Transitions** (no white flash) between pages and modes.
*   **FR-5 [Implemented]:** Content grids and Navigation filter and style automatically based on **Active Mode**.
*   **FR-11 [New]:** Homepage features **Full-screen Showreel Loop** with "Brutal" Scroll-driven Typography (e.g., "WE SHOOT HARD") in Commercial Mode.

**Navigation & Discovery:**
*   **FR-3 [Pending Implementation]:** Visitor experiences **Smooth Scroll (Scrubbing)** interaction. (Metric: Input latency < 16ms / 60fps).
*   **FR-7 [Pending Verification]:** Visitor navigates via **Dynamic Routing** (`/works/[slug]` vs `/stories/[slug]`).
*   **FR-12 [New]:** **Contact Form** adapts destination, fields, and labels based on Active Mode ("Commercial Inquiry" vs "Love Story").

**Content Presentation:**
*   **FR-6 [Modified]:** Work Detail pages display video using **Hybrid Strategy**: Optimized MP4 for Loops, HLS/Vimeo/Mux for Long-form.
*   **FR-13 [New]:** Work Detail pages support **Magazine-Style Layouts** (not just grids), managed via CMS blocks.
*   **FR-15 [New]:** About usage of **Dual-Context Content** (different text/images for Commercial vs Wedding on the same route).

**CMS & Administration:**
*   **FR-8 [Implemented]:** Admin allows creation of pages via **Modular Page Builder** (Drag & Drop blocks).
*   **FR-9 [Implemented]:** Admin manages **Bilingual Content** (TH/EN) via CMS Native Localization (`internationalized-array`).
*   **FR-10 [Implemented]:** Admin manages **Projects** and **Pages** as distinct types.
*   **FR-14 [New]:** CMS Input allows **Drag-and-Drop** of multiple clips for rapid gallery creation (Operational Efficiency).

### NonFunctional Requirements

**Performance & Motion:**
*   **NFR-1 (Load Time):** LCP **< 2.5s** on 4G Mobile; TBT **< 200ms**.
*   **NFR-2 (Smoothness):** Animation/Scroll must run at **60fps (Stable)**. **0 frames dropped** during Mode Transitions.
*   **NFR-3 (Transition):** Visual delay **<= 300ms**; CLS < 0.1.
*   **NFR-10 [New] (Device Tiering):** Motion degrades gracefully on low-end hardware (disable heavy parallax/blur).

**SEO & Discovery:**
*   **NFR-4 (Indexability):** 100% of Landing Pages use **SEO-friendly pre-rendering (ISR/SSR)**.
*   **NFR-5 (Structured Data):** Valid `VideoObject` schema on Detail pages.
*   **NFR-7 [New] (Bilingual SEO):** Implement `hreflang` / `alternate` tags for TH/EN indexing.
*   **NFR-11 [New] (Technical SEO):** Dynamic `sitemap.xml` and `robots.txt` differentiating Production vs Staging.

**Architecture & Quality:**
*   **NFR-6 (Standard Video):** Use native HTML5 for loops; External streaming (HLS) for long-form.
*   **NFR-9 [New] (CMS Safety):** "No-Code Sanctity" - Validations prevent user error (e.g., warn on small images), no raw code injection.

### Additional Requirements

**From Architecture:**
*   **Starter Template:** High-Performance Next.js 16 Boilerplate (Next.js 16.1, React 19.2, Tailwind 4, Motion 12.29, Sanity v5.6).
*   **Core Tech Stack:** ModeProvider (Cookies/LocalStorage), Zustand 5, Sanity v4 (siteMode, i18n-array).
*   **Rendering Strategy:** ISR (60s revalidation) for Marketing pages; Webhook On-demand revalidation for Works.
*   **Implementation Pattern:** "Unstyled First" Radix UI primitives with mode-specific Tailwind variables.

**From UX & Design Assets:**
*   **Cinematic Dualism:** Strict separation of Production (Commercial) and Wedding (Studio) modes.
*   **Page Coverage (Production):** Landing, Portfolio, Services, Contact Us.
*   **Page Coverage (Wedding):** Landing, Portfolio, Services, Packages, About Us/BTS, Contact Us.
*   **Responsive Compliance:** Mobile (375px+), Tablet (768px+), Desktop (1280px+), Ultrawide (1920px+).
*   **Component Strategy:** Prioritize existing `shadcn/ui` components, customizing only for "Cinematic" gaps.

### FR Coverage Map

*   **FR-1 (Mode Switcher):** Epic 1 (Core Logic) & Epic 3 (UI/Experience Refinement).
*   **FR-2 (Persistence):** Epic 1 (Core Implementation).
*   **FR-3 (Smooth Scroll):** Epic 1 (Foundation) & Epic 2 (Detail Scrubbing).
*   **FR-4 (Transitions):** Epic 1 (Global System).
*   **FR-5 (Content Filtering):** Epic 1 (Logic) & Epic 3 (Wedding Context).
*   **FR-6 (Hybrid Video):** Epic 2 (Detail Experience) & Epic 4 (Optimization).
*   **FR-7 (Dynamic Routing):** Epic 2 (Core Routing).
*   **FR-8 (Page Builder):** Epic 4 (Admin Experience Refinement).
*   **FR-9 (Bilingual):** Epic 1 (Foundation) & Epic 4 (Input Refinement).
*   **FR-10 (Project Types):** Epic 3 (Wedding Types) & Epic 4 (Admin Management).
*   **FR-11 (Showreel Loop):** Epic 1 (Commercial Home).
*   **FR-12 (Smart Contact):** Epic 3 (Conversion Logic).
*   **FR-13 (Mag Layouts):** Epic 2 (Detail Experience).
*   **FR-14 (Drag-Drop):** Epic 2 (Implementation) & Epic 4 (Refinement).
*   **FR-15 (Dual-Context):** Epic 2 (Structure) & Epic 3 (Content).

## Epic List

### Epic 1: Dual-Identity Foundation & Commercial Mode (The "Brutal" Core)
Establish the system's core "Dual-Mode" architecture and execute the high-performance Commercial (Production) experience. Focus on refactoring existing foundational code for maintainability and completing the "Brutal" interaction set.
**FRs covered:** FR-1, FR-2, FR-4, FR-5, FR-11, FR-3 (Foundation), FR-9 (Foundation)

### Epic 2: The Cinematic Showcase (Work Detail Experience)
Elevate the "Work Detail" page from a simple grid to a cinematic, magazine-style experience. Implement the hybrid video strategy to ensure high quality with zero lag.
**FRs covered:** FR-6, FR-7, FR-13, FR-14, FR-15 (Structure)

### Epic 3: Wedding Mode & Conversion (The "Emotional" Layer)
Implement the "Wedding Mode" context switch, ensuring a complete transformation of mood (fonts, colors, music). Build the intelligent conversion paths (Contact Form routing) for distinct user groups.
**FRs covered:** FR-1, FR-5, FR-12, FR-15 (Content), FR-10

### Epic 4: CMS Mastery & Operational Efficiency (Admin Power)
Refine the Sanity Studio experience to be strictly "No-Code" and user-friendly for the owner. Implement safeguards, drag-and-drop efficiencies, and final SEO/Performance tuning.
**FRs covered:** FR-8, FR-9, FR-10, FR-14, NFR-All

## Epic 1: Dual-Identity Foundation & Commercial Mode (The "Brutal" Core)

Establish the system's core "Dual-Mode" architecture and execute the high-performance Commercial (Production) experience. Focus on refactoring existing foundational code for maintainability and completing the "Brutal" interaction set.

### Story 1.1: ModeProvider Refactoring & State Persistence

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

### Story 1.2: Cinematic Layout & Global Transitions

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

### Story 1.3: Commercial Homepage Brutal Loop

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

### Story 1.4: Bilingual SEO Foundation for Commercial

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

## Epic 2: The Cinematic Showcase (Work Detail Experience)

Upgrade the existing `project` schema and `MediaGallery` components to support "Cinematic" capabilities (Video & Magazine Layouts) found in design assets.

### Story 2.1: Enable Magazine Layouts for Projects

As a **Content Admin**,
I want **to use the Modular Page Builder inside "Project" documents**,
So that **I can create magazine-style layouts for case studies, not just simple text descriptions.**

**Acceptance Criteria:**

**Given** I am in Sanity Studio editing a "Project"
**When** I scroll to the content area
**Then** I should see a `pageBuilder` array (blocks) instead of a simple Rich Text field
**And** I should be able to add `HeroSection`, `MediaGallerySection`, `TwoColumnSection` blocks.

**Given** I visit a Project Detail page `/works/[slug]`
**When** the page renders
**Then** it should map and render each block in the Builder correctly (using existing Section Components).

**And** the "Project" schema must retain crucial metadata (Client, Services, Year) for SEO and listing cards.

### Story 2.2: Upgrade MediaGallery to Hybrid Video

As a **Visitor**,
I want **to see video loops playing automatically in the gallery grids**,
So that **I can feel the "motion" of the work without clicking play.**

**Acceptance Criteria:**

**Given** the existing `MediaGallerySection` component
**When** I add an item in Sanity
**Then** I should be able to select EITHER an Image OR a Video File (MP4).

**Given** a gallery item is a Video
**When** it renders on the frontend
**Then** it should use a `<video>` tag with `muted`, `autoplay`, `loop`, `playsinline`
**And** it must implement `IntersectionObserver` to only play when in viewport (Performance NFR).

**Given** a gallery item is an Image
**When** it renders
**Then** it should function exactly as before (NextImage optimized).

### Story 2.3: Project Navigation & Cinematic Transitions

As a **Visitor**,
I want **to intuitively browse to the next project at the bottom of the page**,
So that **I keep consuming content without hitting a dead end.**

**Acceptance Criteria:**

**Given** I am viewing a Project Detail page
**When** I scroll to the bottom
**Then** I should see a "Next Project" card or area
**And** it should display the correct next project from the SAME mode (Production projects link to Production, Wedding to Wedding).

**Given** I click "Next Project"
**When** the navigation happens
**Then** the `CurtainWipe` transition (from Epic 1) should trigger, masking the page load.

### Story 2.4: Admin Multi-Drag-and-Drop Efficiency

As a **Content Admin**,
I want **to drag and drop multiple media files (Images/Videos) at once into a gallery**,
So that **I don't have to manually create 20 separate items one by one.**

**Acceptance Criteria:**

**Given** I am editing a `MediaGallerySection` in Sanity
**When** I drag 5 images/videos from my desktop onto the array field
**Then** Sanity should upload them all in parallel
**And** automatically create 5 new array items populated with the media assets.

**Note:** May require a Sanity Plugin or Custom Input Component implementation.

## Epic 3: Wedding Mode & Conversion (The "Emotional" Layer)

Implement the "Wedding Mode" context switch, ensuring a complete transformation of mood (fonts, colors, music). Build the intelligent conversion paths (Contact Form routing) for distinct user groups.

### Story 3.1: Wedding Mode Skinning

As a **Visitor**,
I want **the website to change its entire look and feel when I switch to Wedding Mode**,
So that **I feel I am in a romantic, studio environment rather than a raw production house.**

**Acceptance Criteria:**

**Given** I click "Wedding Mode"
**When** the transition completes
**Then** the background color should become Cream/Beige (from Design System)
**And** the primary font should switch to a Serif font (e.g., Cormorant)
**And** the accent video loops should change from "Standard/Fast" to "Slow/Cinematic".

**Given** I navigate to inner pages (About, Contact)
**When** I am in Wedding Mode
**Then** the "Skin" must persist correctly.

### Story 3.2: Smart Contact Form Routing

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

### Story 3.3: Dual-Context Content Strategy (About Us)

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

### Story 3.4: Wedding Homepage & Packages

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

## Epic 4: CMS Mastery & Operational Efficiency (Admin Power)

Refine the Sanity Studio experience to be strictly "No-Code" and user-friendly for the owner. Implement safeguards, drag-and-drop efficiencies, and final SEO/Performance tuning.

### Story 4.1: SEO & Metadata Perfection

As a **Content Admin**,
I want **every page to automatically have the correct Title, Description, and OG Image**,
So that **links shared on social media look professional and Google indexes the site correctly.**

**Acceptance Criteria:**

**Given** I create a new "Project" or "Page" in Sanity
**When** I publish it
**Then** the frontend should generate dynamic metadata (using `generateMetadata`).

**Given** the site is deployed
**When** I access `/sitemap.xml`
**Then** it should list all active routes (Projects, Pages) dynamically.

**Given** I verify `robots.txt`
**Then** it should Allow all bots on Production domain and Disallow all on Staging.

### Story 4.2: Performance & Motion Tuning (Device Tiering)

As a **User on an old mobile phone**,
I want **the site to be usable and not crash**,
So that **I can still view the content even if I don't see the heavy parallax effects.**

**Acceptance Criteria:**

**Given** the user is on a low-power device (detected via `navigator.hardwareConcurrency` or `Save-Data` header)
**When** the site loads
**Then** heavy parallax and blur effects should be disabled (graceful degradation)
**And** video loops shouldn't autoplay if bandwidth is low.

**Given** the user is on a high-end device
**When** the site loads
**Then** they get the full "Brutal" 60fps experience.

### Story 4.3: CMS Validation & Safeguards (No-Code Sanctity)

As a **Business Owner**,
I want **the CMS to warn me if I upload a bad image or forget a field**,
So that **I don't accidentally break the design of my own website.**

**Acceptance Criteria:**

**Given** I am editing a "Hero Section"
**When** I try to upload a 5MB image
**Then** Sanity should show a Warning: "Image too large, please optimize < 1MB".

**Given** I try to publish a Project without a Slug or Title
**Then** Sanity should Block the publish action with a Validation Error.

**Given** I look for "HTML Embed" fields
**Then** I should NOT find any (to prevent breaking the layout).

### Story 4.4: Final Polish & Deployment Pipeline

As a **Developer**,
I want **the site to automatically revalidate content when Sanity updates**,
So that **the owner sees their changes instantly without waiting for a re-deployment.**

**Acceptance Criteria:**

**Given** I update content in Sanity
**When** I click Publish
**Then** a Webhook should trigger the Next.js On-demand Revalidation (ISR).

**Given** I run a Lighthouse Audit on the final Production build
**Then** Performance, Accessibility, Best Practices, and SEO scores should be 95-100.
