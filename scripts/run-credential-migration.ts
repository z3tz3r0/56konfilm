#!/usr/bin/env tsx

import { runCredentialMigration } from './utils/credentialMigrationRunner';
import { startCredentialMigrationProcess } from './utils/credentialMigrationProcess';
import { confirmCredentialMigration } from './utils/confirmCredentialMigration';

async function main() {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  process.on('SIGINT', cancel);
  process.on('SIGTERM', cancel);
  try {
    process.exitCode = await runCredentialMigration(
      process.argv.slice(2),
      {
        interactive:
          process.stdin.isTTY === true && process.stdout.isTTY === true,
        signal: controller.signal,
        confirm: (message, signal) =>
          confirmCredentialMigration(
            message,
            signal,
            process.stdin,
            process.stdout
          ),
        log: (message) => console.log(message),
        error: (message) => console.error(message),
      },
      (options) => startCredentialMigrationProcess(options)
    );
  } finally {
    process.off('SIGINT', cancel);
    process.off('SIGTERM', cancel);
  }
}

main().catch(() => {
  console.error(
    'Migration runner failed. Completion was not confirmed. Review the documented checks before retrying.'
  );
  process.exitCode = 1;
});
