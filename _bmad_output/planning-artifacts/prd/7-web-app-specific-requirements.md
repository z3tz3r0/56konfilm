# 7. Web App Specific Requirements

## Project-Type Overview
56konfilm is a **Next.js 16.1 (Latest Stable)** web application leveraging **Server-Side Rendering (SSR)** and **Incremental Static Regeneration (ISR)** to achieve the holy grail of "Brutal Visualization" with "Perfect SEO". It is NOT a simple SPA; it is a complex hybrid app designed for content deliverability and search engine dominance.

## Technical Architecture Considerations

*   **Framework:** **Next.js 16.1.5 (Latest Stable)** (App Router).
*   **CMS:** **Sanity Studio v5.6.0 (Latest Stable)**.
*   **UI Library:** **React 19.2.4**.
*   **Animation:** **Framer Motion 12.29.2**.
*   **Rendering Strategy:**
    *   **Marketing Pages (Home, About, Work List):** ISR (Revalidate every 60s) for instant TTS (Time-to-First-Byte) and cache hits.
    *   **Work Detail Pages:** ISR (On-demand revalidation via Sanity Webhook) to ensure content updates are reflected immediately without rebuilding the whole site.
    *   **CMS Preview:** SSR with `usePreview` hook for real-time draft viewing.

## Browser Matrix & Performance Targets
*   **Target Browsers:** Chrome (Last 2 versions), Safari (16+), Firefox (Last 2 versions), Edge. *Note: No IE support.*
*   **Device Support:** Responsive design covering Mobile (375px+), Tablet (768px+), Desktop (1280px+), and Ultrawide (1920px+).
*   **Performance Goals:**
    *   LCP < 2.5s (P75).
    *   CLS < 0.1.
    *   INP < 200ms.

## Metadata & Technical SEO
*   **Metadata:** Dynamic `generateMetadata` for every page, pulling OpenGraph images and descriptions from Sanity.
*   **Sitemap:** Dynamic `sitemap.xml` generated from active CMS routes.
*   **Robots:** `robots.txt` configuration separating Production (Allow) and Staging (Disallow).
*   **Canonical Tags:** Self-referencing canonicals to prevent duplicate content issues across Commercial/Wedding URLs if content overlaps.
