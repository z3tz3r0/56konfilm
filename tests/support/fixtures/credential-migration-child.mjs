// Offline stand-in for the native CLI. It never imports Sanity or reads env files.
import { once } from 'node:events';

const mode = process.argv[2];
const secret =
  'fixture-sensitive-editor $2b$12$fixture-hash Bearer fixture-token';
for (const stream of [process.stdout, process.stderr]) {
  for (let index = 0; index < 128; index++) {
    if (!stream.write(`${secret} ${'x'.repeat(8192)}\n`))
      await once(stream, 'drain');
  }
}
if (mode === 'wait') {
  process.stdout.write('fixture-ready\n');
  setInterval(() => {}, 1000);
} else {
  process.exitCode = mode === 'fail' ? 7 : 0;
}
