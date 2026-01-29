---
trigger: always_on
---

# 56konfilm Project Context

## Project Identity
**56konfilm** is a high-performance, dual-identity portfolio platform for a film production house. It serves two distinct audiences with diametrically opposed aesthetics:
- **Commercial Mode ("The Brutal"):** Dark, high-energy, raw, motion-heavy. Target: Agencies/Producers.
- **Wedding Mode ("The Emotional"):** Light, warm, romantic, elegant. Target: Couples.

## Core Architecture
- **Framework:** Next.js 16 (App Router), React 19
- **CMS:** Sanity v3 (Studio mounted at `/sanity-cms`)
- **Styling:** Tailwind CSS 4, Radix UI
- **Animation:** `motion/react` (formerly framer-motion)
- **State Management:**
  - **Mode:** Managed via Cookies (`mode`) and synchronized with `next-themes` (`dark` = Commercial, `light` = Wedding).
  - **Locale:** Managed via Cookies (`lang`) for Thai (`th`) and English (`en`).

## Key Directories
- **Planning:** `_bmad_output/planning-artifacts/` (PRD, Architecture, Epic Breakdown)
- **BMAD Core:** `_bmad/` (Workflows, Agents)
- **Source:** `src/`
  - `src/app/(site)/`: Next.js Site Pages
  - `src/sanity/schemaTypes/`: CMS Data Models
  - `src/components/`: Reusable UI Components
- **Tests:** `tests/` (Playwright E2E)

## Mode System Details
The "Dual-Identity" is the most critical architectural constraint.
- **Mechanism:** `ModeSwitcher.tsx` handles the toggle.
- **Persistence:** Cookies (`mode`) with 1-year expiry.
- **Theme Sync:** 
  - `mode='production'` -> `theme='dark'`
  - `mode='wedding'` -> `theme='light'`
- **Routing:** Some pages (like Home) have different slugs based on mode, resolved via Sanity.
