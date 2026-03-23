# 🛡️ Import Policies & Dependency Rules

To ensure a clean architecture and prevent **Circular Dependencies**, all developers must adhere to these strict import boundaries.

## 🚫 Restricted Import Flow

We follow a **Unidirectional Dependency Flow**. Lower layers cannot depend on higher layers.

| From (Importer) | To (Importee)           | Status           | Reason                                                   |
| :-------------- | :---------------------- | :--------------- | :------------------------------------------------------- |
| `src/shared/`   | `src/features/`         | ❌ **FORBIDDEN** | Shared must be a standalone foundation.                  |
| `src/shared/`   | `src/app/`              | ❌ **FORBIDDEN** | Shared should not know about routes.                     |
| `src/features/` | `src/features/` (Cross) | ❌ **FORBIDDEN** | Features must be isolated. Use `shared` for common code. |
| `src/app/`      | `src/features/`         | ✅ **ALLOWED**   | App composes features into pages.                        |
| `src/app/`      | `src/shared/`           | ✅ **ALLOWED**   | Global UI and utils are required everywhere.             |

## 🛠️ Detailed Policies

### 1. Shared Integrity

The `src/shared/` folder is the "Standard Library" of our project. It must remain pure and not "reach up" into business logic or routing. If a Shared component needs feature-specific data, it should receive it via **Props**.

### 2. Feature Isolation (The Sibling Rule)

Features are siblings. Siblings do not share clothes directly—they must put them in the "Shared Closet" (`src/shared/`) first.

- 📌 **Example:** `HeroSection` cannot import a component from `AboutSection`.
- 📌 **Solution:** Move the required component to `src/shared/components/common/`.

### 3. Private Page Assets (`_components`)

Components inside an underscore-prefixed folder (e.g., `app/[lang]/_components/`) are **Private**.

- They cannot be imported by any file outside of that specific route directory.
- If you find yourself needing a private component elsewhere, it’s time to promote it to `src/features/` or `src/shared/`.

### 4. Path Aliases & Shortcuts

We provide specific path aliases to keep imports concise and to clearly identify which architectural layer a module belongs to.

| Alias         | Root Path        | Purpose                                        |
| :------------ | :--------------- | :--------------------------------------------- |
| `@/*`         | `src/*`          | Generic absolute import for any file.          |
| `@features/*` | `src/features/*` | Directly access business logic/modules.        |
| `@services/*` | `src/services/*` | Access the Data Access Layer (ContentService). |
| `@shared/*`   | `src/shared/*`   | Access universal components, hooks, and utils. |

**Usage Example:**

- ✅ `import { Button } from '@shared/components/ui/Button'`
- ✅ `import { Hero } from '@features/hero-section/components/Hero'`
- ✅ `import { ContentService } from '@services/ContentService'`

### 5. Absolute Path Enforcement

To maintain code cleanliness and simplify refactoring, we enforce a strict limit on relative imports.

- **Rule:** Relative imports deeper than 3 levels (e.g., `../../../`) are **STRICTLY PROHIBITED**.
- **Requirement:** You must use the `@/` absolute alias for any cross-folder imports that exceed this depth.
- **Exception:** Relative imports (e.g., `./` or `../`) are still allowed for immediate neighbors or child components within the same module/feature.

**Examples:**

- ✅ `import { Button } from '@shared/components/ui/Button'` (Recommended)
- ✅ `import { styles } from './Hero.module.css'` (Allowed for immediate neighbors)
- ❌ `import { utils } from '../../../shared/utils/format'` (Rejected by ESLint)

_Note: This policy is enforced via ESLint `no-restricted-imports` rule._

### 6. Barrel Exports (index.ts)

To keep our import statements clean and concise, we use the **Barrel Export** pattern throughout the project.

- **Standard:** Every directory under `features/` or `shared/` should have an `index.ts` file that exports its public API.
- **Requirement:** Always import from the folder level, not the specific file.
- ✅ `import { Button, ModeSwitcher } from '@shared/components'`
- ❌ `import { Button } from '@shared/components/ui/Button/Button'`
- **🚫 Prohibited:** DO NOT use `index.ts` inside the `src/app/` directory.
- **Reasons:**:
  1. **Architectural Role:** `src/app/` is the **"Assembler"** (the end-of-the-line for our dependency tree). No other layer should ever import from it, making barrel exports unnecessary.
  2. **Next.js Constraints:** App Router uses file-based routing. `index.ts` can cause routing conflicts and unintended "Client/Server Component" boundary leaks, potentially damaging performance.

#### **Special Case: Shared Components**

We provide a "Master Barrel" at `@shared/components/index.ts` which consolidates all sub-categories:

- `ui/*`
- `common/*`
- `layout/*`

**Why we use this?**

1. **Cleanliness:** Reduces the number of import lines in your files.
2. **Encapsulation:** We can change the internal file structure without breaking the imports in other files.
3. **Consistency:** Everyone follows the same pattern, making the code easier to read.

_⚠️ Caution: Avoid circular dependencies when creating barrels in `features/`. Ensure you only export what is truly needed externally._

---

**Failure to follow these rules will result in failed builds or CI/CD rejection.**
