# Epic 4: CMS Mastery & Operational Efficiency (Admin Power)

Refine the Sanity Studio experience to be strictly "No-Code" and user-friendly for the owner. Implement safeguards, drag-and-drop efficiencies, and final SEO/Performance tuning.

## Story 4.1: SEO & Metadata Perfection

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

## Story 4.2: Performance & Motion Tuning (Device Tiering)

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

## Story 4.3: CMS Validation & Safeguards (No-Code Sanctity)

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

## Story 4.4: Final Polish & Deployment Pipeline

As a **Developer**,
I want **the site to automatically revalidate content when Sanity updates**,
So that **the owner sees their changes instantly without waiting for a re-deployment.**

**Acceptance Criteria:**

**Given** I update content in Sanity
**When** I click Publish
**Then** a Webhook should trigger the Next.js On-demand Revalidation (ISR).

**Given** I run a Lighthouse Audit on the final Production build
**Then** Performance, Accessibility, Best Practices, and SEO scores should be 95-100.
