# Development Guide

This guide provides instructions for setting up and working on the 56konfilm project.

## Prerequisites

- **Node.js**: Recommended v20 or later.
- **Package Manager**: `pnpm` is used for managing dependencies.

## Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd 56konfilm
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=qetwj3gt
   NEXT_PUBLIC_SANITY_DATASET=production
   ```

## Development Workflow

### Running Locally

Start the development server with Turbopack:
```bash
pnpm dev
```
The site will be available at `http://localhost:3000`.

### Content Management

Access the embedded Sanity Studio at `/sanity-cms`. You will need credentials (stored in Sanity) to log in to the editorial interface.

### Linting & Formatting

We use ESLint and Prettier to maintain code quality.
- **Check Linting**: `pnpm lint`
- **Format Code**: `pnpm format`

## Production Build

To create a production build and start the server:
```bash
pnpm build
pnpm start
```

## Localization

When adding new fields to Sanity, use the helper functions in `src/sanity/schemaTypes/objects/localized.ts` to ensure consistency.

## Project Shortcuts

The project includes BMAD-specific shortcuts:
- `pnpm bmad:refresh`: Rebuilds the internal codex.
- `pnpm bmad:validate`: Validates project structure against BMAD standards.
