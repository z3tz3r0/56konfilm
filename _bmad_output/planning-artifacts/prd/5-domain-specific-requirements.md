# 5. Domain-Specific Requirements

## Technical Constraints (The "Brutal" Performance)

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

## Operational Constraints

*   **No-Code Sanctity:**
    *   CMS must prevent "User Error" (e.g., warn on small images, auto-truncate long text).
    *   No "Code Injection" fields for users to input raw HTML/CSS (for security and design consistency).
