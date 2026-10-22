import { defineMigration } from 'sanity/migrate';
import { migrateCredentials } from './credentialMigration';

/**
 * Native CLI only; no application env loader or SDK writes in this migration.
 * Preview (username/hash are REDACTED, never apply the printed preview by hand):
 * pnpm exec sanity migrations run protect-cms-credentials --project PROJECT_ID --dataset DATASET_NAME
 * Apply only in a coordinated auth cutover, with a restricted-access backup:
 * pnpm exec sanity migrations run protect-cms-credentials --project PROJECT_ID --dataset DATASET_NAME --no-dry-run --concurrency 1 --no-progress
 *
 * --no-progress is essential: the native CLI otherwise prints secret-bearing
 * transactions. Do not use debug logging or share unreviewed CLI error reports.
 * Pause credential writes and do not restore the public ID on rollback.
 */
export default defineMigration({
  title: 'Protect CMS credentials (redacted preview; apply with --no-progress)',
  documentTypes: ['cmsCredentials'],
  migrate: migrateCredentials,
});
