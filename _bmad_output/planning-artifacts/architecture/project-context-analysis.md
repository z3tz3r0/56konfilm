# Project Context Analysis

## Requirements Overview

**Functional Requirements:**
The system is built as a **Dual-Identity Platform** (Commercial Production vs. Wedding Studio). Key architectural drivers include a **Global Mode Switcher** with persistent state (cookies), a **Modular Page Builder** powered by Sanity v4, and native **Bilingual support (TH/EN)**. Higher complexity interactions involve **Smooth Scroll (Scrubbing)** at 60fps and **Seamless Page Transitions** to maintain a premium cinematic feel.

**Non-Functional Requirements:**
Strict performance targets are set: **LCP < 2.5s** on 4G Mobile, and stable **60fps animations** for all scrolling and transitions. SEO is prioritized with **100% pre-rendering** for landing pages and **VideoObject structured data**. Video playback must utilize **Standard Compliant Video Playback** to minimize bundle size while maintaining performance.

**Scale & Complexity:**
- **Primary domain:** Full-stack Responsive Web (Next.js 16+, React 19)
- **Complexity level:** High (due to dual-mode logic synchronization and high-performance animation requirements)
- **Estimated architectural components:** 25-35 (including Sections, UI Primitives, and shared Layout logic)

## Technical Constraints & Dependencies
- **Core Stack:** Next.js 16.0.7 (App Router), React 19.2.1, Tailwind CSS 4, Sanity v4, Motion (Framer Motion).
- **Data Persistence:** Use of Browser cookies for Mode persistence to enable Middleware-level logic.
- **Localization:** Thai as primary locale, extended by `sanity-plugin-internationalized-array` for English.
- **Design Parity:** Must strictly adhere to high-frame design assets (R01_*.png) across both modes.

## Cross-Cutting Concerns Identified
- **Dual-Mode State Management:** Synchronizing the 'Production' vs 'Wedding' state across Middleware, Theme (Dark/Light), and CMS Query contexts.
- **Performance Budgeting:** Maintaining a 60fps frame rate while rendering rich media and animations.
- **Schema & Type Integrity:** Enforcing strict parity between Sanity Schemas, TypeScript interfaces, and GROQ query selectors.
- **Enterprise-ready Video Handling:** Optimized loading and playback strategies for high-quality production showreels.
