import { defineMigration } from 'sanity/migrate';
import { migrateLogoShowcase } from './logoShowcaseMigration';

/**
 * Run from the repository root using the installed Sanity CLI:
 *   pnpm exec sanity migrations list
 *   pnpm exec sanity migrations run rename-logo-grid-to-logo-showcase --project PROJECT_ID --dataset DATASET_NAME
 * Apply only after reviewing the dry-run and backing up the target dataset:
 *   pnpm exec sanity migrations run rename-logo-grid-to-logo-showcase --project PROJECT_ID --dataset DATASET_NAME --no-dry-run --concurrency 1
 *
 * This migration imports no application env/config and writes no data itself.
 * The CLI owns authentication, configuration, dry-run, and mutation execution;
 * running the CLI may load the project's environment files.
 *
 * Only drafts are changed. Review them in Studio and manually publish alongside
 * the completed FE release; do not deploy the CMS-only phase on its own.
 * A conflict stops the run, but already committed pages are not rolled back.
 * Resolve the conflict and rerun; migrated drafts produce no further changes.
 */
export default defineMigration({
  title: 'Rename logo grid sections to Logo Showcase (drafts only)',
  documentTypes: ['page'],
  // Do not filter out drafts with removed/already-migrated logos: their state
  // must take priority over the corresponding published page.
  filter: '!(_id in path("versions.**"))',
  migrate: migrateLogoShowcase,
});
