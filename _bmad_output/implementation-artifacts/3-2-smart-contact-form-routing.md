# Story 3.2: Smart Contact Form Routing

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Business Owner**,
I want **commercial inquiries and wedding inquiries to go to different destination emails (or subject lines)**,
so that **my team can maximize response speed and not lose leads.**

## Acceptance Criteria

1. **Given** I am in **Commercial Mode**
   **When** I view the contact form
   **Then** the header should say "Commercial Inquiry"
   **And** the submission should tag the lead as "type: commercial".

2. **Given** I am in **Wedding Mode**
   **When** I view the contact form
   **Then** the header should say "Tell us your love story"
   **And** the fields should include "Wedding Date" and "Venue"
   **And** the submission should tag the lead as "type: wedding".

3. **Given** a successful submission
   **Then** the system should route the data to the appropriate handler (simulated or real email service).

4. **Given** I am switching modes while on the Contact page
   **Then** the form content should transition smoothly (animate) between the two states.

## Tasks / Subtasks

- [x] **Infrastructure: Form State & Validation** (AC: #1, #2)
  - [x] Define Zod schemas for `CommercialInquiry` and `WeddingInquiry`.
  - [x] Create a unified schema that discriminates based on `type` (commercial/wedding).
  - [x] Implement `src/actions/contact.ts` (Server Action) to handle submission and "route" logic (log/mock email for now).

- [x] **Component: Smart Contact Form** (AC: #1, #2, #4)
  - [x] Create `src/components/features/contact/ContactForm.tsx`.
  - [x] Integrate `useMode` hook to determine current context.
  - [x] Implement conditional rendering for "Wedding Date" and "Venue" fields.
  - [x] Add `AnimatePresence` (or Motion) for smooth field entrance/exit when switching modes.

- [x] **Page: Contact Page Construction** (AC: #4)
  - [x] Create `src/app/[lang]/contact/page.tsx`.
  - [x] Ensure correct Metadata (SEO) and layout wrapper.

- [x] **Testing: E2E Verification** (AC: #1, #2)
  - [x] Create `tests/e2e/contact-form-routing.spec.ts`.
  - [x] Verify form fields change when toggling ModeSwitcher.
  - [x] Test submission in both modes and verify success toast/feedback.

## Dev Notes

- **Mode Logic:** Access `mode` via `useMode()` hook (from `src/components/providers/ModeProvider`).
- **Styling:** Use `shadcn/ui` components (`Form`, `Input`, `DatePicker`) if available, styled with Tailwind 4 mode vars.
- **Animation:** Use `motion/react` for the field transitions (height, opacity) to avoid jarring Layout Shift.
- **Architecture:** 
  - Do NOT create two separate form components. Use one smart component with conditional fields to maintain shared logic (name, email, phone).
  - Server Action should be the single source of truth for "Routing" logic.

### Project Structure Notes

- **Page:** `src/app/[lang]/contact/page.tsx`
- **Component:** `src/components/features/contact/ContactForm.tsx`
- **Action:** `src/actions/contact.ts`
- **Tests:** `tests/e2e/contact-form-routing.spec.ts`

### References

- [Source: _bmad_output/planning-artifacts/epics/epic-3-wedding-mode-conversion-the-emotional-layer.md#Story 3.2]
- [Source: _bmad_output/planning-artifacts/prd/4-user-journeys.md#2. The Modern Couple]

## Dev Agent Record

### Agent Model Used

Antigravity (M18)

### File List

- `src/app/[lang]/contact/page.tsx`
- `src/components/features/contact/ContactHeader.tsx`
- `src/components/features/contact/ContactForm.tsx`
- `src/components/features/contact/WeddingFields.tsx`
- `src/components/features/contact/useContactForm.ts`
- `src/actions/contact.ts`
- `src/lib/schemas/contact.ts`
- `tests/e2e/contact-form-routing.spec.ts`
- `tests/unit/contact-action.test.ts`
- `tests/unit/contact-validation.test.ts`
- `tests/unit/components/ContactForm.test.tsx`
