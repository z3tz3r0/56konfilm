import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

const { values } = parseArgs({ options: { channel: { type: 'string' } } });
if (values.channel && !['chrome', 'msedge'].includes(values.channel))
  throw new Error(
    'Use --channel=chrome or --channel=msedge, or omit it for Chromium.'
  );
process.env.SKIP_TEST_DOTENV = 'true';
process.env.COMPARISON_BROWSER_CHANNEL = values.channel ?? '';
const { startVitest } = await import('vitest/node');
const ctx = await startVitest(
  'test',
  [],
  {
    root: fileURLToPath(new URL('../../../../', import.meta.url)),
    run: true,
    include: [
      'tests/support/browser/package-comparison/packageComparison.fixture.ts',
    ],
    environment: 'node',
    maxWorkers: 1,
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
  },
  { envFile: false }
);
if (ctx) await ctx.close();
