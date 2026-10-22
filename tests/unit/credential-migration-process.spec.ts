// @vitest-environment node
import { ChildProcess, spawn, type SpawnOptions } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { startCredentialMigrationProcess } from '../../scripts/utils/credentialMigrationProcess';
import { runCredentialMigration } from '../../scripts/utils/credentialMigrationRunner';
import {
  CREDENTIAL_MIGRATION_ID,
  CREDENTIAL_MIGRATION_RUNNER,
} from '../../migrations/protect-cms-credentials/runnerGuard';

const target = ['--project', 'fixtureproject', '--dataset', 'fixture-dataset'];
const fakeCli = fileURLToPath(
  new URL('../support/fixtures/credential-migration-child.mjs', import.meta.url)
);

describe('Native credential migration process boundary', () => {
  it.each([true, false])(
    'forces safe native flags without a shell (dry-run=%s)',
    (dryRun) => {
      const child = new ChildProcess();
      const launch = vi.fn(
        (_command: string, _args: string[], _options: SpawnOptions) => child
      );
      const environment: NodeJS.ProcessEnv = {
        NODE_ENV: 'test',
        FIXTURE_VALUE: 'preserved',
      };
      expect(
        startCredentialMigrationProcess(
          { project: 'fixtureproject', dataset: 'fixture-dataset', dryRun },
          launch,
          environment
        )
      ).toBe(child);
      const [command, args, options] = launch.mock.calls[0];
      expect(command).toBe(process.execPath);
      expect(args[0].replaceAll('\\', '/')).toMatch(/\/sanity\/bin\/sanity$/);
      expect(args.slice(1)).toEqual([
        'migrations',
        'run',
        CREDENTIAL_MIGRATION_ID,
        ...target,
        dryRun ? '--dry-run' : '--no-dry-run',
        '--no-progress',
        '--concurrency',
        '1',
        '--no-confirm',
      ]);
      expect(options).toMatchObject({
        shell: false,
        stdio: 'ignore',
        env: {
          FIXTURE_VALUE: 'preserved',
          [CREDENTIAL_MIGRATION_RUNNER]: CREDENTIAL_MIGRATION_ID,
        },
      });
      expect(options.cwd).toBe(
        fileURLToPath(new URL('../../', import.meta.url))
      );
      expect(environment).toEqual({
        NODE_ENV: 'test',
        FIXTURE_VALUE: 'preserved',
      });
    }
  );

  it.each([
    { mode: 'success', apply: false, code: 0 },
    { mode: 'success', apply: true, code: 0 },
    { mode: 'fail', apply: false, code: 1 },
    { mode: 'fail', apply: true, code: 1 },
  ])(
    'discards large secret-bearing stdout/stderr from a real local child ($mode, apply=$apply)',
    async ({ mode, apply, code }) => {
      const output: string[] = [];
      const controller = new AbortController();
      const confirm = vi.fn().mockResolvedValue(true);
      const launch = vi.fn(
        (_command: string, _args: string[], options: SpawnOptions) =>
          spawn(process.execPath, [fakeCli, mode], options)
      );
      const result = await runCredentialMigration(
        [...target, ...(apply ? ['--no-dry-run'] : [])],
        {
          interactive: true,
          signal: controller.signal,
          confirm,
          log: (message) => output.push(message),
          error: (message) => output.push(message),
        },
        (options) =>
          startCredentialMigrationProcess(options, launch, { NODE_ENV: 'test' })
      );
      expect(result).toBe(code);
      expect(launch).toHaveBeenCalledOnce();
      expect(confirm).toHaveBeenCalledTimes(apply ? 1 : 0);
      for (const secret of [
        'fixture-sensitive-editor',
        '$2b$12$fixture-hash',
        'fixture-token',
        'fixture-ready',
      ]) {
        expect(output.join('\n')).not.toContain(secret);
      }
      expect(output.join('\n')).toContain(
        code === 0 ? 'completed successfully' : 'Completion was not confirmed'
      );
    }
  );

  it('cancels and closes a real local child without forwarding its output', async () => {
    const output: string[] = [];
    const controller = new AbortController();
    let cancel: ReturnType<typeof setTimeout> | undefined;
    let child: ChildProcess | undefined;
    try {
      const result = await runCredentialMigration(
        [...target, '--no-dry-run'],
        {
          interactive: true,
          signal: controller.signal,
          confirm: async () => true,
          log: (message) => output.push(message),
          error: (message) => output.push(message),
        },
        (options) =>
          startCredentialMigrationProcess(
            options,
            (_command, _args, spawnOptions) => {
              child = spawn(process.execPath, [fakeCli, 'wait'], spawnOptions);
              child.once('spawn', () => {
                cancel = setTimeout(() => controller.abort(), 100);
              });
              return child;
            },
            { NODE_ENV: 'test' }
          )
      );
      expect(result).toBe(130);
      expect(output.join('\n')).toContain('may already have committed');
      expect(output.join('\n')).not.toContain('completed successfully');
      expect(output.join('\n')).not.toMatch(
        /fixture-sensitive-editor|fixture-hash|fixture-token/
      );
      expect(child?.exitCode !== null || child?.signalCode !== null).toBe(true);
    } finally {
      clearTimeout(cancel);
      if (child?.exitCode === null && child.signalCode === null) child.kill();
    }
  });
});
