# Source Tree Analysis

This document provides an annotated overview of the 56konfilm codebase structure.

## Overview

The project is a Next.js 16 application using the App Router and a single-repository (monolith) structure.

## Directory Structure

```
.
├── src/
│   ├── app/                # Next.js App Router (Pages & APIs)
│   │   ├── api/            # Backend API routes (Auth)
│   │   ├── sanity-cms/     # Built-in Sanity Studio at /sanity-cms
│   │   └── (site)/         # Main frontend localized pages
│   ├── components/         # React Components
│   │   ├── footer/         # Footer components
│   │   ├── navigation/     # Navbar, Locale/Mode Switchers
│   │   ├── page/           # PageBuilder and Section components
│   │   └── ui/             # Low-level UI primitives (shadcn)
│   ├── lib/                # Shared logic and utilities
│   │   ├── auth.ts         # JWT and password management
│   │   ├── rateLimit.ts    # API rate limiting
│   │   └── i18nUtils.ts    # Localization helpers
│   ├── sanity/             # Sanity CMS Configuration
│   │   ├── lib/            # Sanity client and fetchers
│   │   └── schemaTypes/    # Sanity document and object schemas
│   └── types/              # Global TypeScript interfaces
├── public/                 # Static assets
├── docs/                   # Project documentation (this folder)
├── next.config.ts          # Next.js configuration
├── sanity.config.ts        # Sanity Studio configuration
└── package.json            # Project dependencies and scripts
```

## Key Files & Entry Points

- **`src/app/(site)/[slug]/page.tsx`**: The dynamic route for all modular pages.
- **`src/app/api/auth/login/route.ts`**: Core authentication entry point.
- **`src/sanity/schemaTypes/index.ts`**: Registry for all content patterns.
- **`sanity.config.ts`**: Configures the embedded Sanity Studio.
- **`src/lib/auth.ts`**: Single source of truth for security and sessions.

## Critical Patterns

1. **Localization**: Content is fetched via GROQ and the `lang` cookie is used to select the correct translation in the component layer.
2. **Page Building**: The `page` document in Sanity acts as a blueprint, which `PageBuilder.tsx` translates into React components.
3. **Site Modes**: The project supports 'Production' (Official) and 'Wedding' (Niche) modes, controlled by a global state/cookie.
