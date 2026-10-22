/** An accidental-misuse guard, not an authentication secret or permission check. */
export const CREDENTIAL_MIGRATION_RUNNER = 'CMS_CREDENTIAL_MIGRATION_RUNNER';
export const CREDENTIAL_MIGRATION_ID = 'protect-cms-credentials';

export function assertCredentialMigrationRunner(
  dryRun: boolean,
  marker: string | undefined
): void {
  if (!dryRun && marker !== CREDENTIAL_MIGRATION_ID) {
    throw new Error(
      'Apply requires the safe runner: pnpm exec tsx scripts/run-credential-migration.ts --project PROJECT_ID --dataset DATASET_NAME --no-dry-run'
    );
  }
}
