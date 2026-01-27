# Architecture Documentation

## Executive Summary

The 56konfilm platform is a high-performance, bilingual marketing and portfolio site built using the Next.js App Router and Sanity CMS. It is designed with a "Modular Section" philosophy, allowing non-technical editors to construct complex pages from a library of pre-defined UI components.

## Technology Stack

- **Frontend**: Next.js 16 (React 19), Tailwind CSS 4.
- **CMS**: Sanity v4 (Embedded Studio).
- **Security**: custom JWT/bcrypt authentication logic.
- **Styling**: Radix UI (Primitives) + Tailwind CSS.
- **Animations**: Framer Motion (`motion`).

## Core Architecture Patterns

### Modular Page Builder
The core of the application is a dynamic page builder pattern. Sanity documents of type `page` contain an array of `contentBlocks`. These blocks correspond to React components in `src/components/page/sections/`. The `PageBuilder` component acts as a router, mapping Sanity type names to their respective React implementation.

### Cookie-Based Localization
Unlike standard Next.js localization which often uses URL segments (e.g., `/en/home`), this project uses a `lang` cookie.
- **Default Locale**: Thai (`th`).
- **Mechanism**: A middleware or high-level component reads the `lang` cookie and provides the value to components. Content fetched from Sanity is structured as localized arrays, and the frontend selects the appropriate entry based on the active locale.

### Sanity-Powered Auth
The administrative part of the site (embedded Sanity Studio) and any protected API routes use a custom authentication layer. 
- Credentials (username and hashed password) are stored in a hidden Sanity document (`cmsCredentials`).
- The login API verifies these credentials and issues a JWT stored in an `httpOnly` cookie.

## Data Architecture

### Content Source
Sanity is the single source of truth for all marketing copy, project case studies, and site configurations.

### Database Operations
Being a headless CMS-driven site, standard database operations are handled via GROQ (Graph-Relational Object Queries) through the `next-sanity` client.

## Development Workflow

- **Component Driven**: New sections are developed as React components first, then registered in the Sanity schema.
- **Type Safety**: TypeScript is used throughout to ensure data from Sanity matches the props expected by UI components.
