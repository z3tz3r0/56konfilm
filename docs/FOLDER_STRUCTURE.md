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
│   └── ContentService.ts     # Centralized fetching logic
└── 📁 shared/                # 🔧 Shared Utilities & Core Foundation
    ├── components/
    │   ├── common/           # Smart/Context-aware components (ModeSwitcher, SectionHeader, SectionErrorBoundary)
    │   ├── layout/           # Structural components (Navbar, Footer)
    │   └── ui/               # "Dumb" UI primitives (Button, Input)
    ├── config/               # Env, Cache Tags, Preferences
    ├── hooks/                # Global reusable hooks
    ├── lib/                  # Core engine (i18n, SEO, Auth, Motion)
    ├── providers/            # Providers
    ├── stores/               # Global state management (Zustand)
    └── types/                # Global types (BaseBlock, SectionHeading, etc.)
```

## 🎯 Architectural Layers

### 1. Shared Layer (/src/shared/)

The foundation of the project. Everything here must be reusable across more than one feature.

- 📌 **Rule**: If a component is used in both HeroSection and ContactSection, it belongs here.
- 📌 **Sub-folders**: Separated by responsibility (UI, Layout, Lib, etc.) to prevent a "messy middle".

### 2. Feature Layer (/src/features/)

Modules organized by Page Builder sections.

- 📌 **Colocation**: Hooks, types, and components specific to a feature stay inside that feature's folder.
- 📌 **Isolation**: Features are independent. This makes them easy to refactor or delete without side effects.

### 3. Routing Layer (/src/app/)

The Next.js App Router hierarchy.

- 📌 **Private Folders (\_folder)**: Used for components or assets that are strictly unique to a specific page and not intended for reuse.
- 📌 **Strict Scope**: Page-specific components cannot be imported by other pages.

### 4. Service Layer (/src/services/)

Centralized business logic for data fetching.

- 📌 **ContentService**: Acts as the single source of truth for interacting with Sanity CMS, ensuring consistent cache-tagging and revalidation.

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
