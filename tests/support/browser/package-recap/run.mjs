import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

const { values } = parseArgs({ options: { channel: { type: 'string' } } });
if (values.channel && !['chrome', 'msedge'].includes(values.channel)) {
  throw new Error(
    'Use --channel=chrome or --channel=msedge, or omit it for Playwright Chromium.'
  );
}

process.env.SKIP_TEST_DOTENV = 'true';
process.env.PACKAGE_RECAP_BROWSER_CHANNEL = values.channel ?? '';

const { startVitest } = await import('vitest/node');
const ctx = await startVitest(
  'test',
  [],
  {
    root: fileURLToPath(new URL('../../../../', import.meta.url)),
    run: true,
    include: ['tests/support/browser/package-recap/packageRecap.fixture.tsx'],
    environment: 'node',
    maxWorkers: 1,
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 30000,
  },
  { envFile: false }
);
if (ctx) await ctx.close();
