---
stepsCompleted: [1, 2, 3, 4, 5]
workflowType: 'party-mode'
user_name: 'Z3tz3r0'
date: '2026-01-27'
agents_loaded: true
party_active: false
workflow_completed: true
inputDocuments:
  - _bmad_output/docs/api-contracts.md
  - _bmad_output/docs/architecture.md
  - _bmad_output/docs/data-models.md
  - _bmad_output/docs/development-guide.md
  - _bmad_output/docs/index.md
  - _bmad_output/docs/project-overview.md
  - _bmad_output/docs/source-tree-analysis.md
  - _bmad_output/docs/ui-component-inventory.md
author: Z3tz3r0
---

# Product Brief: 56konfilm

## Executive Summary

**56konfilm** is a high-end, cinematic portfolio platform engineered for a dual-identity Production House. It bridges the gap between **brutal, high-motion aesthetics** (essential for competitive differentiation) and **operational flexibility** (owner-managed updates).

The core differentiator is the **Dual-Identity Platform Architecture**: a single next-gen site that empowers the owner to instantly transition the entire platform—theme, layout, and content—between a high-octane **Commercial Production Mode** and an emotive **Wedding Studio Mode**. Built on Next.js and Sanity CMS, it transforms complex frontend motion into a simplified, modular ecosystem that eliminates developer dependency for day-to-day operations.

---

## Core Vision

### Problem Statement

The production house currently lacks a finished, deployable portfolio that reflects its premium quality. In a market dominated by competitors with visually stunning, high-motion websites, 56konfilm faces a critical operational bottleneck: existing solutions are either "too rigid" (hard-coded custom sites that require developers for every change) or "too generic" (templates that cannot support high-end cinematic motion). Furthermore, the business operates two distinct lines—commercial production and wedding videography—that target polar opposite audiences but must coexist under one brand roof.

### Problem Impact

*   **Brand Fragmentation:** Inability to effectively serve two distinct audiences (Ad Agencies vs. Couples) without maintaining two separate, disconnected websites.
*   **Operational Dependency:** The owner cannot update work, create landing pages, or adjust content strategy without technical intervention, leading to stale portfolios and missed opportunities.

### Why Existing Solutions Fall Short

*   **Standard CMS (WordPress/Wix):** Lacks the technical capability to render "brutal," high-performance animations while maintaining a user-frieldly backend.
*   **Traditional Custom Builds:** Typically lock content into fixed layouts, making it impossible for non-technical owners to dramatically shift the site's tone or structure on the fly.

### Proposed Solution

A **Next.js + Sanity CMS** platform featuring a **Modular Section Architecture**.
*   **Frontend:** A "Brutal Motion" engine that applies premium cinematic animations to every component by default.
*   **Backend:** A "Lego-like" page builder in Sanity Studio, tailored for non-technical users to stack, reorder, and configure pre-built, high-design sections.
*   **Flexibility:** Full bilingual support (TH/EN) and dynamic page generation capabilities.

### Key Differentiators

1.  **Dual-Identity Platform Architecture (Killer Feature):**
    > _Seamlessly transition between two distinct brand identities—**Commercial Production (High-Energy)** and **Wedding Studio (Emotive)**—managing isolated content sets and design themes within a single unified platform._
    This allows the owner to operate two distinct "virtual companies" from a single backend, switching the entire site's mood, color palette, typography, and content universe with a single toggle.

2.  **Owner-First "No-Code" Experience:**
    A bespoke CMS configuration that hides technical complexity. Complex animations and layout shifts are pre-coded into modules, allowing the owner to build "award-winning" level pages simply by filling in text and uploading video.

---

## Target Users

### Primary Users (The "Dual-Audience")

**1. The Creative Director / Agency Producer (Commercial Mode Target)**
*   **Context:** Looking for a bold Production House with a unique visual style for high-stakes ad campaigns.
*   **Needs:** Needs to see a sharp Showreel, cutting-edge Motion Graphics, and a site that signals "Tech-savviness."
*   **Success Scenario:** Lands on the *Commercial Mode* (dark/brutal theme), feels the energy, and thinks, "These people speak my language."

**2. The Modern Couple (Wedding Mode Target)**
*   **Context:** Gen-Z/Millennial couples planning a wedding, looking for a cinematographer who captures "emotion" not just "events."
*   **Needs:** Needs accessibility, gentleness, emotional connection, and a vibe that feels personal.
*   **Success Scenario:** Switches to *Wedding Mode* (light/soft theme), feels the romantic atmosphere through different music/visuals, and trusts the brand with their big day.

### Secondary Users (Internal)

**The Business Owner / Content Lead (Admin User)**
*   **Role:** Owner of 56konfilm & Primary Editor.
*   **Context:** Extremely busy, high aesthetic standards, zero patience for coding or waiting on devs.
*   **Pain Point:** Current site is too rigid; cannot spin up a custom landing page for a specific client pitch tomorrow.
*   **Success Vision:** Manages two worlds (Commercial/Wedding) from one dashboard. Swaps sections like Lego blocks. Publishes updates instantly with confidence that the "complex frontend" won't break.

### User Journey (The "Switch" Experience)

1.  **Discovery:** User lands on Homepage (Default Mode).
2.  **Interaction:** Notices a prominent **"Switch Mode"** toggle or entry gate.
3.  **Transformation (The Aha! Moment):** Click triggers an instant site-wide metamorphosis—Theme, Font, Music, and Content all shift context.
4.  **Conversion:**
    *   *Commercial User* explores rigorous portfolio and Technical Rate Card.
    *   *Wedding User* browses emotional stories and Wedding Packages.
5.  **Retention (Note for Admin):** Owner tracks distinct traffic behaviors and optimizes each "world" independently without code.

---

## Success Metrics

### Technical Excellence (Non-Negotiable)

*   **Lighthouse Performance Score:** **100/100** on both Mobile and Desktop. This is a critical requirement despite the "Brutal Motion" aesthetic.
*   **Core Web Vitals:** All metrics must pass Google's "Good" thresholds (LCP < 2.5s, CLS = 0, FID < 100ms) to ensure premium feel and SEO favorability.
*   **Animation Smoothness:** 60fps locked on standard devices; no jank during complex transitions or mode switches.

### SEO Domination

*   **Ranking Goal:** Achieve #1 ranking for niche keywords in both "Commercial Production House Bangkok" and "Cinematic Wedding Videography" sectors.
*   **Technical SEO:** 100/100 Health Score on Ahrefs/Lighthouse.
*   **Discoverability:** Perfect implementation of Structured Data (Schema.org) for `VideoObject`, `LocalBusiness`, and `AggregateRating` to capture Rich Results.

### Operational Efficiency (The "Owner" Metric)

*   **Agility:** Owner must be able to create, populate, and publish a new custom Landing Page in **< 15 minutes**.
*   **Autonomy:** 100% of front-end content (Text, Images, Videos, Layout Order) must be editable without Developer intervention.

### Business Impact

*   **Conversion Rate:** Measurable increase in "high-quality" leads (e.g., specific inquiries from ad agencies) attributed to the portfolio site.
*   **Brand Authority:** Qualitative feedback from clients specifically mentioning the efficient, professional online experience as a deciding factor.

---

## MVP Scope

### Musy-Have Features (Phase 1)

1.  **Homepage (The Gateway)**
    *   **Dual Mode Switcher:** A globally accessible toggle (Sticky or Nav-integrated) to switch between Commercial/Wedding modes instantly.
    *   **Dynamic Hero Section:** Supports different "Showreel" video loops for each mode.

2.  **Work Detail Page (The "Cinematic" Experience)**
    *   **High-Fidelity Video Player:** Custom player wrapper (Vimeo/Custom) that supports auto-play, loop, and full-screen without UI clutter.
    *   **Modular Storytelling:** Layout that allows mixing full-width video, grid images, and text narrative (Owner controllable).

3.  **About & Contact**
    *   **Dual-Context Content:** "About" page text must dynamically shift tone based on the active mode (e.g., "Our Crew" vs. "Our Vibe").
    *   **Smart Routing:** Contact forms that route inquiries to different internal labels/emails based on the user's mode (Agency/Wedding).

4.  **CMS Backbone (Owner-First)**
    *   **Sanity Studio V3:** Customized "Desk Structure" separating Commercial and Wedding content buckets.
    *   **Page Builder:** Drag-and-drop section reordering capability.

### Out of Scope (Phase 2+)

*   **Integrated Booking System:** No real-time calendar or payment gateway for Wedding packages in MVP (use Contact Form instead).
*   **E-Commerce:** No extensive merchandise or preset store (simple outbound links allowed).
*   **User Accounts:** No client login portal for file delivery (files delivered via external links).

### Future Vision

*   **Client Project Portal:** A private login area for clients to view rough cuts and leave comments directly on the timeline (Frame.io integration).
*   **Automated Booking:** Full availability calendar for Wedding shoots with Stripe integration.
*   **AI Montage Generator:** Auto-generating "Best of" showreels from uploaded clips using AI video analysis.
