import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';

/** EOF and cancellation resolve false rather than leaving a pending question. */
export function confirmCredentialMigration(
  message: string,
  signal: AbortSignal,
  input: Readable,
  output: Writable
): Promise<boolean> {
  if (signal.aborted) return Promise.resolve(false);
  return new Promise((resolve) => {
    const terminal = createInterface({ input, output, terminal: false });
    const finish = (confirmed: boolean) => {
      signal.removeEventListener('abort', onAbort);
      terminal.off('line', onLine);
      terminal.off('close', onClose);
      terminal.close();
      resolve(confirmed);
    };
    const onLine = (answer: string) =>
      finish(answer.trim().toLowerCase() === 'y');
    const onClose = () => finish(false);
    const onAbort = () => finish(false);
    terminal.once('line', onLine);
    terminal.once('close', onClose);
    signal.addEventListener('abort', onAbort, { once: true });
    output.write(message);
    if (signal.aborted) onAbort();
  });
}
