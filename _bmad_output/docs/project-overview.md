# Project Overview

56konfilm is a modern, cinematic portfolio platform designed for a production house. It balances rich visual storytelling with a flexible editorial workflow.

## Key Features

- **Modular Page Building**: Efficiently create new landing pages by stacking pre-designed sections.
- **Bilingual Support**: Full Thai and English content parity with a seamless switching experience.
- **Embedded CMS**: Sanity Studio is integrated directly into the application for consolidated management.
- **Custom Authentication**: Secure editorial access backed by hashed credentials and JWT sessions.
- **Cinematic UI**: Dark-themed, high-contrast design optimized for visual media and video production showcases.

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| CMS | Sanity |
| CSS | Tailwind 4 |
| UI/UX | Radix UI, Framer Motion |
| Auth | Custom JWT + bcrypt |

## Directory Guide

- `src/app`: Application routes and API logic.
- `src/components`: Reusable UI and page-building sections.
- `src/sanity`: Content schemas and CMS configuration.
- `src/lib`: Core utility functions (Auth, Localization, Rate Limiting).
- `docs/`: Technical and operational documentation.
