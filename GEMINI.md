# GEMINI.md

## Project Overview

This is a [Next.js](https://nextjs.org/) project that uses [Sanity](https://www.sanity.io/) as a headless CMS. The project is set up to display content and manage it through the Sanity Studio.

**Key Technologies:**

- **Framework:** [Next.js](https://nextjs.org/)
- **CMS:** [Sanity](https://www.sanity.io/)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) and [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Linting:** [ESLint](https://eslint.org/)
- **Formatting:** [Prettier](https://prettier.io/)
- **Framework:** [Next.js](https://nextjs.org/)
- **CMS:** [Sanity](https://www.sanity.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) and [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Linting:** [ESLint](https://eslint.org/)
- **Formatting:** [Prettier](https://prettier.io/)

**Architecture:**

- The frontend is a Next.js application located in the `src/app` directory.
- The Sanity Studio is mounted at `/sanity-cms` and is configured in `sanity.config.ts`.
- Sanity schema definitions are located in `src/sanity/schemaTypes`.

## Building and Running

**1. Install Dependencies:**

```bash
npm install
```

**2. Run the Development Server:**

```bash
npm run dev
```

This will start the Next.js development server at `http://localhost:3000`.

**3. Run the Sanity Studio:**

The Sanity Studio is integrated into the Next.js application and can be accessed at `http://localhost:3000/sanity-cms`.

**4. Build for Production:**

```bash
npm run build
```

This will create a production-ready build of the Next.js application.

**5. Start the Production Server:**

```bash
npm run start
```

This will start the Next.js production server.

## Development Conventions

- **Formatting:** The project uses Prettier for code formatting. You can format the code by running:

  ```bash
  npm run format
  ```

- **Linting:** The project uses ESLint for linting. You can check for linting errors by running:

  ```bash
  npm run lint
  ```

* **Internationalization:** All text that is displayed to the user should be added to the `src/messages/en.json` file and then referenced in the code using the `useTranslations` hook from `next-intl`.
