---
trigger: always_on
---

# Code Patterns & Conventions

**Trigger:** When writing React Components or Sanity Queries.

## Sanity & GROQ
1.  **Safeguard:** Before editing queries, ALWAYS consult the `@sanity-query-safeguard` skill.
2.  **Filtering:** Almost all content queries must filter by `siteMode`:
    ```groq
    *[_type == "project" && $mode in siteMode]
    ```
3.  **Localization:** Use the `LOCALIZED` fragment helper for i18n fields:
    ```typescript
    import { LOCALIZED } from './queries/fragments';
    // ...
    "title": ${LOCALIZED('title')}
    ```

## React & UI Components
1.  **Shadcn Integration:** Check for existing components via `@shadcn-manager` before building from scratch.
2.  **Styling:** 
    - Use `Tailwind CSS`.
    - Use `cn()` utility (`import { cn } from '@/lib/utils'`) for class merging.
3.  **Motion:** 
    - Use `motion/react` (import from `motion/react`, NOT `framer-motion`).
    - Pattern: `<motion.div animate={{...}} />`.

## Mode Synchronization Logic
When implementing mode-switching logic (e.g., in a Context or Component):
1.  **Set Cookie:** `mode=value; Path=/; Max-Age=31536000`
2.  **Set Theme:** Explicitly call `setTheme()` from `next-themes` to match:
    - `production` -> `dark`
    - `wedding` -> `light`
3.  **Explanation:** We explicitly sync them because `next-themes` controls the CSS variables, while the cookie controls the Server-Side Content fetching. Both must be aligned.

### ⚠️ CRITICAL CONSTRAINTS
- **ModeSwitcher Animation:** Never add side-effects (like `setTheme`) inside the `useEffect` of `ModeSwitcher.tsx`. It MUST remain a pure state sync to protect the smooth cinematic animation flow. The optimistic update is handled in `handleModeChange` only.
