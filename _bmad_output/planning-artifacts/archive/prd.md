---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
classification:
  projectType: web_app
  domain: Media & Entertainment
  complexity: High Technical Complexity
  projectContext: greenfield
inputDocuments:
  - /home/z3tz3r0/Projects/56konfilm/_bmad_output/planning-artifacts/product-brief-56konfilm-2026-01-27.md
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
workflowType: prd
---

# Product Requirements Document - 56konfilm

**Author:** Z3tz3r0
**Date:** 2026-01-27
**Status:** DRAFT (Polished & Detailed)

## 1. Executive Summary

**56konfilm** is a high-end, cinematic portfolio platform engineered for a dual-identity Production House. It bridges the gap between **brutal, high-motion aesthetics** (essential for competitive differentiation) and **operational flexibility** (owner-managed updates).

The core differentiator is the **Dual-Identity Platform Architecture**: a single next-gen site that empowers the owner to instantly transition the entire platform—theme, layout, and content—between a high-octane **Commercial Production Mode** and an emotive **Wedding Studio Mode**. Built on **Next.js** and **Sanity CMS**, it transforms complex frontend motion into a simplified, modular, **Owner-First** ecosystem that eliminates developer dependency for day-to-day operations.

## 2. Success Criteria

### User Success

*   **Dual-Audience Satisfaction:**
    *   *Creatives (Commercial):* Feel the power/professionalism from "brutal" motion design that remains fluid.
    *   *Couples (Wedding):* Feel the emotion and care from the soft, accessible wedding theme.
*   **Seamless Transition:** Users can switch modes instantly without jank, creating a "wowed" experience from the first click.

### Business Success

*   **Conversion Quality:** Increase high-quality leads from the correct target audience in each mode.
*   **Brand Authority:** Receive qualitative feedback from clients praising the professionalism and image of the website.
*   **SEO Dominance:** Rank #1 for niche keywords in both "Commercial Production House Bangkok" and "Cinematic Wedding Videography" sectors.

### Technical Success

*   **Performance:**
    *   Lighthouse Score: **100/100** (Mobile & Desktop).
    *   Animation: **60fps** locked (No layout shift, No jank during mode switch).
    *   Core Web Vitals: Pass all "Good" thresholds (LCP < 2.5s, CLS = 0, FID < 100ms).
*   **Code Quality:** SEO Structured Data 100% correct for Rich Results.

### Measurable Outcomes

*   **Operations (Time-to-Publish):** Owner can create and publish a new Landing Page within **< 15 minutes**.
*   **Autonomy:** Owner can manage 100% of frontend content (Text, Images, Video, Layout) without developer dependency.

## 3. Product Scope

### MVP - Minimum Viable Product (Phase 1)

1.  **Core Architecture:** Next.js + Sanity CMS supporting Dual-Identity (Commercial / Wedding).
2.  **Pages:**
    *   Homepage (with Dynamic Mode Switcher).
    *   Work Detail Page (Custom Video Player & Modular Layout).
    *   About (Dual-Context Content).
    *   Contact (Smart Routing).
3.  **Features:**
    *   Brutal Motion Components (60fps).
    *   Page Builder with Modular Blocks.
    *   Bilingual Support (TH/EN).

### Growth Features (Post-MVP)

*   **Out of Scope for MVP:**
    *   Real-time integrated booking system.
    *   Full E-Commerce system (use outbound links instead).
    *   Client Login Portal for file delivery.

### Vision (Future)

*   **Client Project Portal:** Private login area for clients to view rough cuts and comment (Frame.io integration).
*   **Automated Booking:** Pre-wedding shoot calendar with payment integration.
*   **AI Montage Generator:** Automated showreel generation from uploaded clips.

## 4. User Journeys

### 1. The Agency Creative: "Hunting for the Edge" (Commercial Mode)

*   **Persona:** "Ploy" (32), Agency Producer looking for a production house with strong design aesthetics for a new Energy Drink campaign.
*   **Opening Scene:** Ploy is stressed. Her client wants something "raw" and "energetic" (Brutal & High Energy). She's looked at 10 competitors but only found boring, flat portfolios.
*   **Rising Action:** She clicks a link to 56konfilm recommended by a colleague.
    *   *First Impression:* Site loads instantly (LCP < 2.5s) with a solid black background and a fast-paced showreel loop playing full screen.
    *   *Interaction:* She scrolls (scrub interaction) and sees large text "WE SHOOT HARD" running across the screen smoothly (60fps).
*   **Climax:**
    *   She clicks into the "Work Detail" page of a racing car project. The video plays continuously without stutter. She sees a production breakdown in a magazine-style layout, not just a grid.
    *   She feels "wowed" by the taste and presentation, which feels more like a fashion film than a corporate video.
*   **Resolution:** Ploy clicks "Contact" (clearly labeled for Commercial inquiry) and sends the brief immediately, pasting the link in her team Slack saying, "Found it. This is the one."

### 2. The Modern Couple: "The Emotional Connection" (Wedding Mode)

*   **Persona:** "Toey & Beam" (28), Gen-Z couple looking for a wedding videographer with a minimal & warm theme.
*   **Opening Scene:** They receive the link from a friend, but land on the "Commercial Mode" (dark, raw) homepage. They pause, thinking, "Is this the right link? It looks scary."
*   **Rising Action:**
    *   *The Switch:* Toey notices the toggle button at the top right labeled "Wedding Mode". She clicks it.
    *   *Transformation:* The screen fades from black to a soft Cream/Beige. Fonts change from thick Sans-serif to elegant Serif. Aggressive music fades into acoustic tracks.
*   **Climax:**
    *   They watch a Wedding Highlight video playing at a slower, cinematic pace. The layout shifts to a warm collage style.
    *   Toey feels "relieved" and "impressed" that the same cinematographer can shift moods so effectively (Trust in versatility).
*   **Resolution:** Feeling they've found someone who understands both cool and sweet, they fill out the contact form (now titled "Tell us about your love story") to ask for package prices.

### 3. The Business Owner: "The 15-Minute Pitch" (Admin Journey)

*   **Persona:** "K.B" (35), Owner of 56konfilm, about to fly to Singapore for an urgent pitch.
*   **Opening Scene:** A Singapore client messages asking to see all "Cyberpunk" style works. K.B is at the airport with only 20 minutes before boarding.
*   **Rising Action:**
    *   K.B opens Sanity Studio on his iPad.
    *   Clicks "Create New Landing Page".
    *   Selects Template: "Commercial Project Grid".
*   **Climax:**
    *   He types "Cyberpunk" in the Media Library search. The system pulls up tagged clips.
    *   He drags and drops 4-5 clips into the block.
    *   Types a short intro and clicks Preview... The page renders beautifully as if it took a week to design.
*   **Resolution:**
    *   Clicks "Publish" (total time: 12 minutes).
    *   Copies the link and mocks it to the client via WhatsApp, then boards the plane with confidence (Operational Efficiency).

## 5. Domain-Specific Requirements

### Technical Constraints (The "Brutal" Performance)

*   **Strict Performance Budget:**
    *   **LCP (Largest Contentful Paint):** Must be < 2.5s even on video-heavy pages. Requires high-quality, optimized Poster Images for all videos.
    *   **TBT (Total Blocking Time):** Must be < 200ms for fluid responsiveness.
    *   **Motion Jank:** 0 frames dropped during transitions. Strict rule: no lag during mode switching.
*   **SEO & Discovery (Media Domain):**
    *   **VideoObject Schema:** Correct implementation of Structured Data for video indexing.
    *   **Image Optimization:** Automatic Next-gen format (WebP/AVIF) and responsive sizing.
    *   **Bilingual SEO:** Use `hreflang` / `alternate` tags to support search indexing for both languages.
*   **Media Delivery:**
    *   **Video Hosting:** Must use third-party hosting (Vimeo Pro / Mux / Cloudflare Stream) with Adaptive Bitrate Streaming (HLS). Self-hosting large MP4s is prohibited for long-form; optimized MP4 for short loops only.

### Operational Constraints

*   **No-Code Sanctity:**
    *   CMS must prevent "User Error" (e.g., warn on small images, auto-truncate long text).
    *   No "Code Injection" fields for users to input raw HTML/CSS (for security and design consistency).

## 6. Innovation & Novel Patterns

### Core Innovations

1.  **Dual-Identity State Management:**
    *   *Concept:* Global State system managing the entire "Mood Context" of the site (Colors, Fonts, Layout Density, Music, Content Filter).
    *   *Novelty:* Moving beyond simple Dark/Light modes to a complete "Brand Personality" switch from *Aggressive Commercial* to *Soft Romantic* in real-time.

2.  **Brutal Motion at Scale (No-Code):**
    *   *Concept:* Pre-coded Motion Blocks in Sanity CMS where the user simply selects a block and adds media, with the system handling Parallax, Page Transitions, and Scroll Scrubbing at 60fps.
    *   *Novelty:* Bringing high-end motion (usually requiring hard-coding) into a CMS that the owner can manage 100% independently.

### Market Context & Competitive Landscape

*   **Competitors:** Production houses often use generic Vimeo Showcases or rigid template sites (Squarespace/Wix). Custom builds are often hard to update.
*   **Gap:** No existing platform serves "Multi-disciplinary Production Houses" well. Separating Commercial and Wedding identities in one cohesive platform saves massive maintenance costs/effort compared to running two sites.

### Validation Approach

*   **A/B Testing (Switch Interaction):** Track the "Switch Mode" button click event to validate user engagement and measure if it increases/decreases Time-on-site.
*   **Performance Monitoring:** Use Vercel Analytics to monitor Real User Experience (RUX), specifically focusing on frame drops during Mode Transitions.

### Risk Mitigation

*   **Complexity Overload:**
    *   *Risk:* CMS becomes too complex for the owner.
    *   *Mitigation:* Design a minimal Sanity Desk Structure, hiding all technical fields and exposing only essential content fields.
*   **SEO Fragmentation:**
    *   *Risk:* Google might be confused about the site's primary topic (Commercial vs. Wedding).
    *   *Mitigation:* Clear Sitemap/Schema separation and semantic URL structures (e.g., `/commercial/work/...` vs `/wedding/stories/...`).
*   **Device Performance:** Implement "Device Tiering" to degrade motion gracefully on low-end hardware.

## 7. Web App Specific Requirements

### Project-Type Overview
56konfilm is a **Next.js 16.1 (Latest Stable)** web application leveraging **Server-Side Rendering (SSR)** and **Incremental Static Regeneration (ISR)** to achieve the holy grail of "Brutal Visualization" with "Perfect SEO". It is NOT a simple SPA; it is a complex hybrid app designed for content deliverability and search engine dominance.

### Technical Architecture Considerations

*   **Framework:** **Next.js 16.1.5 (Latest Stable)** (App Router).
*   **CMS:** **Sanity Studio v5.6.0 (Latest Stable)**.
*   **UI Library:** **React 19.2.4**.
*   **Animation:** **Framer Motion 12.29.2**.
*   **Rendering Strategy:**
    *   **Marketing Pages (Home, About, Work List):** ISR (Revalidate every 60s) for instant TTS (Time-to-First-Byte) and cache hits.
    *   **Work Detail Pages:** ISR (On-demand revalidation via Sanity Webhook) to ensure content updates are reflected immediately without rebuilding the whole site.
    *   **CMS Preview:** SSR with `usePreview` hook for real-time draft viewing.

### Browser Matrix & Performance Targets
*   **Target Browsers:** Chrome (Last 2 versions), Safari (16+), Firefox (Last 2 versions), Edge. *Note: No IE support.*
*   **Device Support:** Responsive design covering Mobile (375px+), Tablet (768px+), Desktop (1280px+), and Ultrawide (1920px+).
*   **Performance Goals:**
    *   LCP < 2.5s (P75).
    *   CLS < 0.1.
    *   INP < 200ms.

### Metadata & Technical SEO
*   **Metadata:** Dynamic `generateMetadata` for every page, pulling OpenGraph images and descriptions from Sanity.
*   **Sitemap:** Dynamic `sitemap.xml` generated from active CMS routes.
*   **Robots:** `robots.txt` configuration separating Production (Allow) and Staging (Disallow).
*   **Canonical Tags:** Self-referencing canonicals to prevent duplicate content issues across Commercial/Wedding URLs if content overlaps.

## 8. Functional Requirements (Capability Contract)

### Dual-Identity & Interaction
*   **FR-1 [Implemented]:** Visitor can toggle "Commercial/Wedding" modes via global **Mode Switcher**.
*   **FR-2 [Implemented]:** System persists **Mode Preference** (Cookie/LocalStorage) across sessions.
*   **FR-3 [Pending Implementation]:** Visitor experiences **Smooth Scroll (Scrubbing)** interaction. (Action: Implement `Lenis` in `layout.tsx`)
*   **FR-4 [Implemented]:** System handles **Seamless Page Transitions** (no white flash).

### Content Consumption
*   **FR-5 [Implemented]:** Content grids filter automatically based on **Active Mode**.
*   **FR-6 [Modified]:** Work Detail pages display video using **Native HTML5 Video** (Standard `<video>` tag for performance/simplicity).
*   **FR-7 [Pending Verification]:** Visitor navigates via **Dynamic Routing** (`/works/[slug]` vs `/stories/[slug]`).

### Content Management (Admin)
*   **FR-8 [Implemented]:** Admin allows creation of pages via **Modular Page Builder**.
*   **FR-9 [Implemented]:** Admin manages **Bilingual Content** (TH/EN) via Sanity `internationalizedArray`.
*   **FR-10 [Implemented]:** Admin manages **Projects** and **Pages** as distinct types.

## 9. Non-Functional Requirements (Quality Attributes)

### Performance
*   **NFR-1 (Load Time):** LCP **< 2.5s** on 4G Mobile.
*   **NFR-2 (Smoothness):** Animation/Scroll must run at **60fps (Stable)** on Mid-tier devices.
*   **NFR-3 (Transition):** Visual delay **<= 300ms**; CLS < 0.1.

### SEO & Discoverability
*   **NFR-4 (Indexability):** 100% of Landing Pages use **ISR/SSR**.
*   **NFR-5 (Structured Data):** Valid `VideoObject` schema on Detail pages.

### Integration
*   **NFR-6 (Standard Video):** Use optimized HTML5 video without external heavy player libraries.
