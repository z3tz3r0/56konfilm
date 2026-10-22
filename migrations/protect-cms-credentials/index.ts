import { defineMigration } from 'sanity/migrate';
import { migrateCredentials } from './credentialMigration';
import {
  assertCredentialMigrationRunner,
  CREDENTIAL_MIGRATION_RUNNER,
} from './runnerGuard';

/**
 * Native migration declarations; run through the credential-specific wrapper.
 * Safe dry-run (no writes or raw CLI output):
 * pnpm exec tsx scripts/run-credential-migration.ts --project PROJECT_ID --dataset DATASET_NAME
 * Apply only in a coordinated auth cutover, with a restricted-access backup:
 * pnpm exec tsx scripts/run-credential-migration.ts --project PROJECT_ID --dataset DATASET_NAME --no-dry-run
 *
 * The wrapper forces --no-progress and suppresses raw child errors. Direct
 * native apply is blocked; discovery and redacted native dry-run remain usable.
 * Never apply printed preview JSON. Pause credential writes during cutover.
 */
export default defineMigration({
  title: 'Protect CMS credentials (apply through the safe credential runner)',
  documentTypes: ['cmsCredentials'],
  async *migrate(documents, context) {
    assertCredentialMigrationRunner(
      context.dryRun,
      process.env[CREDENTIAL_MIGRATION_RUNNER]
    );
    yield* migrateCredentials(documents, context);
  },
});
