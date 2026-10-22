import type { ChildProcess } from 'node:child_process';
import { parseArgs } from 'node:util';
import { CREDENTIAL_MIGRATION_ID } from '../../migrations/protect-cms-credentials/runnerGuard';

export interface CredentialMigrationOptions {
  project: string;
  dataset: string;
  dryRun: boolean;
}

export interface CredentialMigrationIO {
  interactive: boolean;
  signal: AbortSignal;
  confirm: (message: string, signal: AbortSignal) => Promise<boolean>;
  log: (message: string) => void;
  error: (message: string) => void;
}

const usage =
  'Usage: pnpm exec tsx scripts/run-credential-migration.ts --project PROJECT_ID --dataset DATASET_NAME [--dry-run | --no-dry-run]';

function parseOptions(args: string[]): CredentialMigrationOptions | 'help' {
  const { values, tokens } = parseArgs({
    args,
    strict: true,
    allowPositionals: false,
    tokens: true,
    options: {
      project: { type: 'string' },
      dataset: { type: 'string' },
      'dry-run': { type: 'boolean' },
      'no-dry-run': { type: 'boolean' },
      help: { type: 'boolean' },
    },
  });
  const names = tokens.flatMap((token) =>
    token.kind === 'option' ? [token.name] : []
  );
  if (
    new Set(names).size !== names.length ||
    (values['dry-run'] && values['no-dry-run'])
  )
    throw new Error('Invalid options');
  if (values.help) return 'help';
  if (!values.project?.trim() || !values.dataset?.trim())
    throw new Error('Explicit project and dataset are required');
  return {
    project: values.project,
    dataset: values.dataset,
    dryRun: !values['no-dry-run'],
  };
}

type Outcome = 'completed' | 'failed' | 'cancelled';

function waitForChild(
  child: ChildProcess,
  signal: AbortSignal
): Promise<Outcome> {
  return new Promise((resolve) => {
    let failed = false;
    let cancelled = false;
    const onError = () => {
      failed = true;
    };
    const onAbort = () => {
      cancelled = true;
      // No SDK payloads are forwarded, including errors raised during shutdown.
      child.kill('SIGTERM');
    };
    child.on('error', onError);
    child.once('close', (code, childSignal) => {
      signal.removeEventListener('abort', onAbort);
      child.off('error', onError);
      resolve(
        cancelled || childSignal === 'SIGINT' || childSignal === 'SIGTERM'
          ? 'cancelled'
          : !failed && childSignal === null && code === 0
            ? 'completed'
            : 'failed'
      );
    });
    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) onAbort();
  });
}

/** Only the entry starts real processes; tests inject a local fake child. */
export async function runCredentialMigration(
  args: string[],
  io: CredentialMigrationIO,
  start: (options: CredentialMigrationOptions) => ChildProcess
): Promise<0 | 1 | 130> {
  let options: CredentialMigrationOptions | 'help';
  try {
    options = parseOptions(args);
  } catch {
    // parseArgs errors include the original arguments. Never print them.
    io.error(
      'Invalid migration arguments. Provide one project and dataset; unsafe or unknown flags are not supported.'
    );
    io.error(usage);
    return 1;
  }
  if (options === 'help') {
    io.log(usage);
    io.log(
      'Defaults to dry-run. Apply requires an interactive confirmation. Native progress and raw CLI output are always disabled.'
    );
    return 0;
  }
  const cancel = (started: boolean) => {
    io.error('Migration cancelled.');
    if (started && !options.dryRun)
      io.error(
        'Apply was interrupted. Check credential locations before retrying; changes may already have committed.'
      );
    return 130 as const;
  };
  if (io.signal.aborted) return cancel(false);
  io.log(`Migration: ${CREDENTIAL_MIGRATION_ID}`);
  // Quoting escapes terminal control characters in user-supplied target names.
  io.log(
    `Project: ${JSON.stringify(options.project)}; dataset: ${JSON.stringify(options.dataset)}; mode: ${options.dryRun ? 'dry-run' : 'apply'}.`
  );
  if (!options.dryRun) {
    if (!io.interactive) {
      io.error(
        'Apply requires an interactive terminal. No migration was started.'
      );
      return 1;
    }
    let confirmed = false;
    try {
      confirmed = await io.confirm(
        'Apply this credential migration? (y/N): ',
        io.signal
      );
    } catch {
      if (io.signal.aborted) return cancel(false);
      io.error('Unable to read confirmation. No migration was started.');
      return 1;
    }
    if (!confirmed || io.signal.aborted) return cancel(false);
  }
  io.log('Starting credential migration…');
  let outcome: Outcome;
  try {
    outcome = await waitForChild(start(options), io.signal);
  } catch {
    outcome = 'failed';
  }
  if (outcome === 'cancelled') return cancel(true);
  if (outcome === 'failed') {
    io.error(
      'Migration failed. Completion was not confirmed. Review the documented checks before retrying.'
    );
    return 1;
  }
  io.log(
    options.dryRun
      ? 'Dry run completed successfully. No changes were applied.'
      : 'Migration command completed successfully. Verify credential locations using the documented checks.'
  );
  io.log(
    'Mutation details are hidden to protect credentials. A successful command may have required no changes.'
  );
  return 0;
}
