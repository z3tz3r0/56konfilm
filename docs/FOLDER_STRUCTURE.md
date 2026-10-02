# 📂 Project Folder Structure Guide

This document outlines the architectural pattern and folder organization for this project. We follow the principles of **Colocation** and **Feature-based Isolation** to ensure scalability and maintainability.

## 🏗️ Visual Overview

```plaintext
src/
├── 📁 app/                   # 📄 Presentation Layer (Next.js App Router)
│   └── [lang]/
│       └── [mode]/           # Production | Wedding
│           └── _components/  # Private components for specific routes
├── 📁 features/              # 🚀 Feature Layer (Page builder sections)
│   ├── PageBuilder.tsx       # Section renderer with per-section error boundaries
│   ├── hero-section/
|   |   ├── actions/         # ⚡ Server Actions (MUST contain 'use server')
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── validation/
│   └── [other-features]/
├── 📁 sanity/                # Sanity CMS Configuration & Schemas
├── 📁 services/              # 🟡 Data Access Layer (DAL)
│   ├── contentService.ts     # Sanity content use cases
│   └── emailService.ts       # Contact email delivery use case
└── 📁 shared/                # 🔧 Shared Utilities & Core Foundation
    ├── components/
    │   ├── common/           # Smart/Context-aware components (ModeSwitcher, SectionHeader, SectionErrorBoundary)
    │   ├── layout/           # Structural components (Navbar, Footer)
    │   └── ui/               # "Dumb" UI primitives (Button, Input)
    ├── config/               # Env, Cache Tags, Preferences
    ├── hooks/                # Global reusable hooks
    ├── lib/                  # Third-party library and external API integrations
    │   ├── auth/             # password.ts, session.ts, sanityCredentials.ts; integration barrel
    │   ├── http/             # Shared HTTP transport
    │   ├── integrations/     # Resend and Turnstile adapters
    │   └── motion/           # Motion library helpers
    ├── providers/            # Providers
    ├── stores/               # Global state management (Zustand)
    ├── types/                # Global types (BaseBlock, SectionHeading, etc.)
    └── utils/                # Application helpers; direct file imports, no index.ts
        ├── password/         # passwordValidation.ts
        ├── performance/      # deviceTier.ts and deviceTier.types.ts
        ├── preferences/      # preferenceGuards.ts and derivePreferences.ts
        ├── rate-limit/       # authRateLimit.ts and contactRateLimit.ts
        ├── seo/              # metadata.ts and projectJsonLd.ts
        ├── styling/          # tailwindUtils.ts and styleVariants.ts
        ├── url/              # siteUrl.ts, contextUrl.ts and googleMaps.ts
        └── paginationUtils.ts
```

## 🎯 Architectural Layers

### 1. Shared Layer (/src/shared/)

The foundation of the project. Everything here must be reusable across more than one feature.

- 📌 **Rule**: If a component is used in both HeroSection and ContactSection, it belongs here.
- 📌 **Sub-folders**: Separated by responsibility (UI, Layout, Lib, etc.) to prevent a "messy middle".

#### Library integrations vs application utilities

- **`lib/`** contains code that integrates with third-party libraries or external APIs, including bcrypt, JWT, Sanity, Motion, HTTP, Resend and Turnstile. Integration does not necessarily mean a network request: bcrypt and Motion also run locally.
- **`utils/`** contains application helpers grouped by concern. Styling helpers remain here even when they use small supporting libraries such as `clsx` and `tailwind-merge`; the folder is not a ban on dependencies.
- There is no `index.ts` at the root or in any subdirectory of `utils/`. Import from the implementation file, including type-only imports; do not re-export utilities through another barrel.
- Keep Auth and Contact rate-limit modules and counters separate. Client-safe utilities and the Contact limiter must not import the Auth integration barrel or start its cleanup timer.
- Auth's `lib/auth/index.ts` exports only password, session and Sanity credential helpers. Password-strength validation belongs in `utils/password/` and is imported directly.

```typescript
import { cn } from '@shared/utils/styling/tailwindUtils';
import { validatePasswordStrength } from '@shared/utils/password/passwordValidation';
import type { DeviceTier } from '@shared/utils/performance/deviceTier.types';
```

The shadcn `aliases.utils` setting in `components.json` points directly to `@shared/utils/styling/tailwindUtils` so generated components follow this convention.

### 2. Feature Layer (/src/features/)

Modules organized by Page Builder sections.

- 📌 **Colocation**: Hooks, types, and components specific to a feature stay inside that feature's folder.
- 📌 **Isolation**: Features are independent. This makes them easy to refactor or delete without side effects.

### 3. Routing Layer (/src/app/)

The Next.js App Router hierarchy.

- 📌 **Private Folders (\_folder)**: Used for components or assets that are strictly unique to a specific page and not intended for reuse.
- 📌 **Strict Scope**: Page-specific components cannot be imported by other pages.

### 4. Service Layer (/src/services/)

Centralized use-case services for content access and email delivery.

- 📌 **ContentService**: Acts as the single source of truth for interacting with Sanity CMS, ensuring consistent cache-tagging and revalidation.
- 📌 **EmailService**: Coordinates Contact email delivery through HTTP and provider adapters; its activation process is documented in [CONTACT_EMAIL_ACTIVATION.md](CONTACT_EMAIL_ACTIVATION.md).

## 🏷️ Naming Conventions

To maintain a predictable and professional codebase, we strictly follow these naming patterns:

| Entity               | Pattern      | Example                          |
| :------------------- | :----------- | :------------------------------- |
| **Folders**          | `kebab-case` | `hero-section/`, `contact-form/` |
| **Standard Files**   | `camelCase`  | `submitContact.ts`, `useMode.ts` |
| **React Components** | `PascalCase` | `Button.tsx`, `ModeSwitcher.tsx` |

### ⚠️ Special Rule: Zod vs Sanity Schemas

To prevent confusion with **Sanity CMS Schemas**, we follow these naming rules:

1. **Folder Name:** NEVER use `schemas/` for Zod validation. Always use **`validation/`**.
2. **File Name:** Use the suffix `Schema.ts` (e.g., `contactSchema.ts`).
3. **Usage Example:** `src/features/contact-section/validation/contactSchema.ts`

## 🛡️ Dependency & Import Rules

To maintain this structure and prevent "Spaghetti Code", we enforce strict import policies.

PLEASE REFER TO: [docs/IMPORT_POLICIES.md](https://github.com/z3tz3r0/56konfilm/blob/main/docs/IMPORT_POLICIES.md)
