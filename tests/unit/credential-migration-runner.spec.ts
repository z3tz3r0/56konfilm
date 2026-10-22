// @vitest-environment node
import { ChildProcess } from 'node:child_process';
import { PassThrough } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import {
  runCredentialMigration,
  type CredentialMigrationOptions,
} from '../../scripts/utils/credentialMigrationRunner';
import { confirmCredentialMigration } from '../../scripts/utils/confirmCredentialMigration';

const target = ['--project', 'fixtureproject', '--dataset', 'fixture-dataset'];
const apply = [...target, '--no-dry-run'];
const secret = 'fixture-username $2b$12$fixture-hash Bearer fixture-token';

function fixture() {
  const child = new ChildProcess();
  const kill = vi.spyOn(child, 'kill').mockReturnValue(true);
  const controller = new AbortController();
  const output: string[] = [];
  const confirm = vi.fn().mockResolvedValue(true);
  const start = vi.fn((_options: CredentialMigrationOptions) => child);
  const io = {
    interactive: true,
    signal: controller.signal,
    confirm,
    log: (message: string) => output.push(message),
    error: (message: string) => output.push(message),
  };
  return {
    child,
    kill,
    controller,
    output,
    confirm,
    start,
    io,
    run: (args: string[] = target) => runCredentialMigration(args, io, start),
  };
}

describe('Credential migration runner', () => {
  it('defaults to dry-run with explicit targets and waits for close, not exit', async () => {
    const { run, start, child, output, confirm } = fixture();
    const pending = run();
    expect(start).toHaveBeenCalledWith({
      project: 'fixtureproject',
      dataset: 'fixture-dataset',
      dryRun: true,
    });
    expect(confirm).not.toHaveBeenCalled();
    expect(output.join('\n')).toContain('Starting credential migration');
    child.emit('exit', 0, null);
    await Promise.resolve();
    expect(output.join('\n')).not.toContain('completed successfully');
    child.emit('close', 0, null);
    expect(await pending).toBe(0);
    expect(output.join('\n')).toContain(
      'Dry run completed successfully. No changes were applied.'
    );
    expect(output.join('\n')).not.toContain('locations verified');
  });

  it('allows explicit dry-run and does not require an interactive terminal', async () => {
    const { run, io, child } = fixture();
    io.interactive = false;
    const pending = run([...target, '--dry-run']);
    child.emit('close', 0, null);
    expect(await pending).toBe(0);
  });

  it('prints help without starting a child or requiring targets', async () => {
    const { run, start, output } = fixture();
    expect(await run(['--help'])).toBe(0);
    expect(start).not.toHaveBeenCalled();
    expect(output.join('\n')).toContain('Defaults to dry-run');
  });

  it.each(
    [
      [],
      ['--project', 'fixtureproject'],
      ['--dataset', 'fixture-dataset'],
      [...target, '--progress'],
      [...target, '--progress=true'],
      [...target, '--no-progress'],
      [...target, '--no-confirm'],
      [...target, '--concurrency', '5'],
      [...target, '--from-export', secret],
      [...target, '--unknown', secret],
      [...target, 'another-migration'],
      [...target, '--project', secret],
      [...target, '--dataset', secret],
      [...target, '--dry-run', '--no-dry-run'],
      [...target, '--dry-run', '--dry-run'],
      ['--project', '', '--dataset', 'fixture'],
      ['--project', 'fixture', '--dataset', '   '],
    ].map((args) => ({ args }))
  )(
    'rejects unsafe or ambiguous arguments without echoing values (%#)',
    async ({ args }) => {
      const { run, start, confirm, output } = fixture();
      expect(await run(args)).toBe(1);
      expect(start).not.toHaveBeenCalled();
      expect(confirm).not.toHaveBeenCalled();
      expect(output.join('\n')).not.toContain(secret);
      expect(output.join('\n')).toContain('Invalid migration arguments');
    }
  );

  it('escapes terminal control characters when displaying the target', async () => {
    const { run, child, output } = fixture();
    const pending = run([
      '--project',
      'fixture\u001b[31m',
      '--dataset',
      'data\nset',
    ]);
    child.emit('close', 0, null);
    expect(await pending).toBe(0);
    expect(output.join('\n')).not.toContain('\u001b');
    expect(output.join('\n')).toContain('data\\nset');
  });

  it('confirms apply exactly once before starting the native child', async () => {
    const { run, start, confirm, child, output } = fixture();
    let answer: (value: boolean) => void = () => {};
    confirm.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          answer = resolve;
        })
    );
    const pending = run(apply);
    expect(start).not.toHaveBeenCalled();
    expect(confirm).toHaveBeenCalledTimes(1);
    answer(true);
    await Promise.resolve();
    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({ dryRun: false })
    );
    child.emit('close', 0, null);
    expect(await pending).toBe(0);
    expect(output.join('\n')).toContain('Verify credential locations');
    expect(output.join('\n')).toContain('may have required no changes');
  });

  it('refuses non-interactive apply without starting a child', async () => {
    const { run, io, start, confirm } = fixture();
    io.interactive = false;
    expect(await run(apply)).toBe(1);
    expect(start).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });

  it('cancels a declined or EOF confirmation without starting a child', async () => {
    const { run, confirm, start, output } = fixture();
    confirm.mockResolvedValue(false);
    expect(await run(apply)).toBe(130);
    expect(start).not.toHaveBeenCalled();
    expect(output).toContain('Migration cancelled.');
  });

  it('does not expose prompt errors', async () => {
    const { run, confirm, start, output } = fixture();
    confirm.mockRejectedValue(new Error(secret));
    expect(await run(apply)).toBe(1);
    expect(start).not.toHaveBeenCalled();
    expect(output.join('\n')).not.toContain(secret);
  });

  it('cancels an already-aborted invocation before any prompt or child', async () => {
    const { run, controller, confirm, start } = fixture();
    controller.abort();
    expect(await run(apply)).toBe(130);
    expect(confirm).not.toHaveBeenCalled();
    expect(start).not.toHaveBeenCalled();
  });

  it('does not start apply if cancellation occurs during confirmation', async () => {
    const { run, controller, confirm, start } = fixture();
    confirm.mockImplementation(async () => {
      controller.abort();
      return true;
    });
    expect(await run(apply)).toBe(130);
    expect(start).not.toHaveBeenCalled();
  });

  it.each([1, 7, null])(
    'fails on nonzero or unknown close code %s',
    async (code) => {
      const { run, child, output } = fixture();
      const pending = run();
      child.emit('close', code, null);
      expect(await pending).toBe(1);
      expect(output.join('\n')).toContain('Completion was not confirmed');
      expect(output.join('\n')).not.toContain('completed successfully');
    }
  );

  it('reports a single safe failure after an asynchronous spawn error and close', async () => {
    const { run, child, output } = fixture();
    const pending = run();
    child.emit('error', new Error(secret));
    expect(output.join('\n')).not.toContain('Migration failed.');
    child.emit('close', -1, null);
    expect(await pending).toBe(1);
    expect(
      output.filter((line) => line.startsWith('Migration failed.'))
    ).toHaveLength(1);
    expect(output.join('\n')).not.toContain(secret);
    expect(child.listenerCount('error')).toBe(0);
  });

  it('sanitizes synchronous process-start failures', async () => {
    const { run, start, output } = fixture();
    start.mockImplementation(() => {
      throw new Error(secret);
    });
    expect(await run()).toBe(1);
    expect(output.join('\n')).not.toContain(secret);
  });

  it('forwards cancellation to an active apply and warns that it may have committed', async () => {
    const { run, start, controller, child, kill, output } = fixture();
    const pending = run(apply);
    await Promise.resolve();
    expect(start).toHaveBeenCalledOnce();
    controller.abort();
    expect(kill).toHaveBeenCalledWith('SIGTERM');
    expect(output.join('\n')).not.toContain('Migration cancelled.');
    child.emit('close', 0, null);
    expect(await pending).toBe(130);
    expect(output.join('\n')).toContain('may already have committed');
    expect(output.join('\n')).not.toContain('completed successfully');
  });

  it.each(['SIGINT', 'SIGTERM', 'SIGKILL'])(
    'does not report success for child signal %s',
    async (signal) => {
      const { run, child } = fixture();
      const pending = run();
      child.emit('close', null, signal);
      expect(await pending).toBe(signal === 'SIGKILL' ? 1 : 130);
    }
  );

  it('removes cancellation listeners after completion', async () => {
    const { run, child, kill, controller } = fixture();
    const pending = run();
    child.emit('close', 0, null);
    expect(await pending).toBe(0);
    controller.abort();
    expect(kill).not.toHaveBeenCalled();
  });
});

describe('Credential migration confirmation', () => {
  it.each([
    ['y\n', true],
    [' Y \n', true],
    ['n\n', false],
    ['\n', false],
  ] as const)(
    'handles answer %j without leaving listeners',
    async (answer, expected) => {
      const input = new PassThrough();
      const output = new PassThrough();
      const controller = new AbortController();
      const pending = confirmCredentialMigration(
        'Apply? ',
        controller.signal,
        input,
        output
      );
      input.write(answer);
      expect(await pending).toBe(expected);
      expect(input.listenerCount('data')).toBe(0);
    }
  );

  it('resolves false on EOF instead of hanging', async () => {
    const input = new PassThrough();
    const pending = confirmCredentialMigration(
      'Apply? ',
      new AbortController().signal,
      input,
      new PassThrough()
    );
    input.end();
    expect(await pending).toBe(false);
  });

  it.each([true, false])(
    'resolves false on cancellation (before prompt=%s)',
    async (alreadyAborted) => {
      const input = new PassThrough();
      const controller = new AbortController();
      if (alreadyAborted) controller.abort();
      const pending = confirmCredentialMigration(
        'Apply? ',
        controller.signal,
        input,
        new PassThrough()
      );
      controller.abort();
      expect(await pending).toBe(false);
      expect(input.listenerCount('data')).toBe(0);
    }
  );
});
