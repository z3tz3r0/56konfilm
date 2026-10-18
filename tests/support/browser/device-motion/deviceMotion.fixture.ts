import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import {
  chromium,
  expect,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from 'vitest';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const directory = resolve(root, 'tests/support/browser/device-motion');
let browser: Browser, context: BrowserContext, page: Page;
let script: string;
let requests: string[];
let errors: string[];

beforeAll(async () => {
  const require = createRequire(import.meta.url);
  const { build } = await import(
    createRequire(require.resolve('vitest/package.json')).resolve('vite')
  );
  const result = await build({
    root,
    configFile: false,
    envFile: false,
    logLevel: 'error',
    plugins: [react()],
    oxc: { jsx: { development: false } },
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    resolve: {
      alias: [
        {
          find: /^@shared\/components$/,
          replacement: resolve(directory, 'components.tsx'),
        },
        {
          find: /^@shared\/hooks$/,
          replacement: resolve(root, 'src/shared/hooks/useDeviceTier.ts'),
        },
        {
          find: 'next/image',
          replacement: resolve(directory, 'components.tsx'),
        },
        { find: '@shared', replacement: resolve(root, 'src/shared') },
        { find: '@features', replacement: resolve(root, 'src/features') },
      ],
    },
    build: {
      write: false,
      lib: {
        entry: resolve(directory, 'entry.tsx'),
        name: 'DeviceMotionFixture',
        formats: ['iife'],
      },
    },
  });
  const output = Array.isArray(result) ? result[0] : result;
  if (!('output' in output))
    throw new Error('Expected an in-memory fixture bundle.');
  script = output.output
    .filter((chunk: { type: string }) => chunk.type === 'chunk')
    .map((chunk: { code: string }) => chunk.code)
    .join('\n');
  browser = await chromium.launch({
    headless: true,
    channel: process.env.DEVICE_MOTION_BROWSER_CHANNEL || undefined,
  });
});

beforeEach(async () => {
  requests = [];
  errors = [];
  context = await browser.newContext({
    reducedMotion: 'no-preference',
    serviceWorkers: 'block',
    viewport: { width: 1280, height: 800 },
  });
  await context.route('**/*', (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setContent(`<style>
    body { margin: 16px; }
    output { display: block; height: 80px; overflow: hidden; }
    .h-full { height: 100%; }
    .w-full { width: 100%; }
    .portfolio-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .portfolio-grid > div { display: grid; grid-row: span 2; grid-template-rows: subgrid; }
    .collage { margin-block: 20px; }
    .video-frame { position: relative; height: 100px; }
    video { height: 100px; }
  </style><div id='root'></div>`);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      configurable: true,
      value: 8,
    });
    HTMLMediaElement.prototype.play = function () {
      this.dataset.playing = 'true';
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {
      this.dataset.playing = 'false';
    };
  });
  await page.addScriptTag({ content: script });
});

afterEach(async () => {
  try {
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
  } finally {
    await context?.close();
  }
});
afterAll(async () => {
  await browser?.close();
});

async function show() {
  await page.evaluate(() =>
    (
      window as typeof window & { showDeviceMotionFixture: () => void }
    ).showDeviceMotionFixture()
  );
  await expect(page.getByTestId('tier')).toContainText('"isInitialized":true');
}

describe('real Motion and shared device-tier subscription in a browser', () => {
  it.each([375, 1280])(
    'preserves card identity, state, focus and geometry at %spx',
    async (width) => {
      await page.setViewportSize({ width, height: 800 });
      await show();
      for (const name of ['First project', 'Collage project']) {
        const button = page.getByRole('button', { name: `${name}: 0` });
        await button.click();
        const selected = page.getByRole('button', { name: `${name}: 1` });
        await expect(selected.locator('..')).toHaveCSS('opacity', '1');
        const box = await selected.boundingBox();
        const handle = await selected.elementHandle();
        for (const reducedMotion of [
          'reduce',
          'no-preference',
          'reduce',
        ] as const) {
          await page.emulateMedia({ reducedMotion });
          await expect(selected).toBeFocused();
          expect(await handle!.evaluate((element) => element.isConnected)).toBe(
            true
          );
          expect(await selected.boundingBox()).toEqual(box);
        }
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }
    }
  );

  it('restores capable-device flags after entering with reduced motion enabled', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await show();
    await expect(page.getByTestId('tier')).toContainText(
      '"allowHeavyMotion":false'
    );
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.getByTestId('tier')).toContainText(
      '"allowHeavyMotion":true'
    );
    await expect(page.getByTestId('tier')).toContainText(
      '"prefersReducedMotion":false'
    );
  });

  it.each(['hardware', 'data saver'])(
    'retains %s constraints after reduced motion is disabled',
    async (constraint) => {
      await page.evaluate((value) => {
        Object.defineProperty(
          navigator,
          value === 'hardware' ? 'hardwareConcurrency' : 'connection',
          {
            configurable: true,
            value: value === 'hardware' ? 2 : { saveData: true },
          }
        );
      }, constraint);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await show();
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect(page.getByTestId('tier')).toContainText(
        '"prefersReducedMotion":false'
      );
      await expect(page.getByTestId('tier')).toContainText(
        '"allowHeavyMotion":false'
      );
      await expect(page.getByTestId('tier')).toContainText(
        '"allowVideoAutoplay":false'
      );
    }
  );

  it('makes offscreen reveals visible immediately and allows subsequent viewport entry', async () => {
    await show();
    const item = page.getByTestId('stat-item');
    await expect(item).toHaveCSS('opacity', '0');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(item).toHaveCSS('opacity', '1');
    expect(
      await item.evaluate(
        (element) => getComputedStyle(element.parentElement!).opacity
      )
    ).toBe('1');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await item.scrollIntoViewIfNeeded();
    await expect(item).toHaveCSS('opacity', '1');
  });

  it('restores gallery video viewport tracking after switching to the fallback', async () => {
    await show();
    await expect(page.getByTestId('video-item')).toHaveAttribute(
      'data-playing',
      'true'
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.getByTestId('video-item-fallback')).toBeVisible();
    await expect(page.getByTestId('video-item')).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.getByTestId('video-item')).toHaveAttribute(
      'data-playing',
      'true'
    );
    await page.evaluate(() => window.scrollTo(0, 1400));
    await expect(page.getByTestId('video-item')).toHaveAttribute(
      'data-playing',
      'false'
    );
  });
});
