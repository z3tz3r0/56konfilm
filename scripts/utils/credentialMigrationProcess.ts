import {
  spawn,
  type ChildProcess,
  type SpawnOptions,
} from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CREDENTIAL_MIGRATION_ID,
  CREDENTIAL_MIGRATION_RUNNER,
} from '../../migrations/protect-cms-credentials/runnerGuard';
import type { CredentialMigrationOptions } from './credentialMigrationRunner';

type SpawnMigration = (
  command: string,
  args: string[],
  options: SpawnOptions
) => ChildProcess;

/** Kept separate from prompts so no shell, env loader or CLI is needed in tests. */
export function startCredentialMigrationProcess(
  options: CredentialMigrationOptions,
  spawnProcess: SpawnMigration = spawn,
  environment: NodeJS.ProcessEnv = process.env
) {
  const require = createRequire(import.meta.url);
  const cli = resolve(
    dirname(require.resolve('sanity/package.json')),
    'bin/sanity'
  );
  return spawnProcess(
    process.execPath,
    [
      cli,
      'migrations',
      'run',
      CREDENTIAL_MIGRATION_ID,
      '--project',
      options.project,
      '--dataset',
      options.dataset,
      options.dryRun ? '--dry-run' : '--no-dry-run',
      '--no-progress',
      '--concurrency',
      '1',
      '--no-confirm',
    ],
    {
      cwd: fileURLToPath(new URL('../../', import.meta.url)),
      shell: false,
      // Discard at the OS boundary: no output buffering or secret-bearing errors.
      stdio: 'ignore',
      env: {
        ...environment,
        [CREDENTIAL_MIGRATION_RUNNER]: CREDENTIAL_MIGRATION_ID,
      },
    }
  );
}
