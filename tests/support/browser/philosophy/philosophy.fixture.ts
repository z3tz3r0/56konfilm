import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/postcss';
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
import type { Locale, SiteMode } from '@shared/config/preferences';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const directory = resolve(root, 'tests/support/browser/philosophy');
let browser: Browser, context: BrowserContext, page: Page;
let css: string, script: string;
let requests: string[], errors: string[];

beforeAll(async () => {
  const require = createRequire(import.meta.url);
  const { build } = await import(
    createRequire(require.resolve('vitest/package.json')).resolve('vite')
  );
  const postcss = createRequire(require.resolve('@tailwindcss/postcss'))(
    'postcss'
  );
  const stylesheet = resolve(root, 'src/app/globals.css');
  const sources = [
    'src/features/philosophy-section/components/PhilosophySection.tsx',
    'src/shared/components/common/AppIcon.tsx',
    'src/shared/components/common/HighlightedText.tsx',
    'src/shared/components/common/SectionShell.tsx',
    'src/shared/utils/styling/styleVariants.ts',
  ];
  const original = await readFile(stylesheet, 'utf8');
  const scoped = original.replace(
    /@import ['"]tailwindcss['"];/,
    '@import "tailwindcss" source(none);\n' +
      sources
        .map(
          (file) => `@source "${resolve(root, file).replaceAll('\\', '/')}";`
        )
        .join('\n')
  );
  if (scoped === original)
    throw new Error('Refusing an unrestricted Tailwind scan.');
  css = (
    await postcss([tailwind({ base: root })]).process(scoped, {
      from: stylesheet,
    })
  ).css;
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
          find: '@iconify/react',
          replacement: resolve(directory, 'iconify.tsx'),
        },
        {
          find: 'next/image',
          replacement: resolve(
            root,
            'tests/support/browser/logo-showcase/fixtureImage.tsx'
          ),
        },
        {
          find: '@/sanity/lib/image',
          replacement: resolve(
            root,
            'tests/support/browser/timeline-icons/forbiddenMedia.ts'
          ),
        },
        { find: '@features', replacement: resolve(root, 'src/features') },
        { find: '@shared', replacement: resolve(root, 'src/shared') },
        { find: '@', replacement: resolve(root, 'src') },
      ],
    },
    build: {
      write: false,
      lib: {
        entry: resolve(directory, 'entry.tsx'),
        name: 'PhilosophyFixture',
        formats: ['iife'],
      },
    },
  });
  const output = Array.isArray(result) ? result[0] : result;
  if (!('output' in output))
    throw new Error('Expected an in-memory fixture bundle.');
  script = output.output
    .filter((item: { type: string }) => item.type === 'chunk')
    .map((item: { code: string }) => item.code)
    .join('\n');
  browser = await chromium.launch({
    headless: true,
    channel: process.env.PHILOSOPHY_BROWSER_CHANNEL || undefined,
  });
});

beforeEach(async () => {
  requests = [];
  errors = [];
  context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    serviceWorkers: 'block',
  });
  await context.route('**/*', (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setContent(
    '<!doctype html><html><head><style>' +
      css +
      ':root{--font-sora:Arial;--font-noto-sans-thai:Arial;--font-cormorant-garamond:Georgia;--font-ibm-plex-sans-thai:Arial;--font-manrope:Arial;--font-anuphan:Arial}' +
      '</style></head><body><div id="root"></div></body></html>'
  );
  await page.addScriptTag({ content: script });
});
afterEach(async ({ task }) => {
  if (task.result?.state === 'fail' && page && !page.isClosed()) {
    const dir = resolve(root, 'play-results/philosophy');
    await mkdir(dir, { recursive: true });
    await page.screenshot({
      path: resolve(dir, `${task.id}.png`),
      fullPage: true,
    });
  }
  await context?.close();
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});
afterAll(async () => {
  await browser?.close();
});

/**
 * Renders the browser fixture with the requested content and theme, then waits
 * for the section to be visible and its reveal animation to reach full opacity.
 */
async function show(
  options: {
    mode?: SiteMode;
    lang?: Locale;
    quote?: string;
    background?: string;
  } = {}
) {
  await page.evaluate(
    (options) =>
      (
        window as unknown as {
          showPhilosophyFixture: (options: unknown) => void;
        }
      ).showPhilosophyFixture(options),
    options
  );
  await expect(page.getByTestId('philosophy-section')).toBeVisible();
  await expect
    .poll(() =>
      page
        .getByTestId('philosophy-quote')
        .evaluate((node) => Number(getComputedStyle(node).opacity))
    )
    .toBe(1);
}

/**
 * Asserts quote geometry, typography, closing-icon rotation and lack of
 * horizontal overflow for the supplied viewport width, with a 768px breakpoint.
 */
async function assertLayout(width: number) {
  const heading = page.getByRole('heading', { level: 2 });
  const opening = page
    .getByTestId('philosophy-opening-quote')
    .locator('[data-slot="app-icon"]');
  const closing = page
    .getByTestId('philosophy-closing-quote')
    .locator('[data-slot="app-icon"]');
  const [text, left, right] = await Promise.all([
    heading.boundingBox(),
    opening.boundingBox(),
    closing.boundingBox(),
  ]);
  if (!text || !left || !right) throw new Error('Missing quote geometry.');
  const desktop = width >= 768;
  for (const icon of [left, right]) {
    expect(icon.width).toBeCloseTo(desktop ? 100 : 60, 0);
    expect(icon.height).toBeCloseTo(desktop ? 100 : 60, 0);
  }
  expect(Math.abs(text.x + text.width / 2 - width / 2)).toBeLessThanOrEqual(1);
  if (desktop) {
    expect(left.x + left.width).toBeLessThanOrEqual(text.x);
    expect(right.x).toBeGreaterThanOrEqual(text.x + text.width);
    expect(left.y).toBeCloseTo(text.y, 0);
    expect(right.y).toBeCloseTo(text.y, 0);
    expect(text.width).toBeLessThanOrEqual(690);
  } else {
    // SectionShell's existing container may be narrower than the viewport.
    const available = await page.getByTestId('philosophy-quote').boundingBox();
    if (!available) throw new Error('Missing quote container.');
    expect(left.x).toBeCloseTo(available.x - 16, 0);
    expect(right.x + right.width).toBeCloseTo(
      available.x + available.width + 16,
      0
    );
    expect(text.width).toBeCloseTo(available.width, 0);
    expect(left.y).toBeLessThan(text.y);
    expect(right.y).toBeCloseTo(left.y, 0);
  }
  expect(
    await heading.evaluate((node) => getComputedStyle(node).fontSize)
  ).toBe(desktop ? '40px' : '24px');
  expect(
    await heading.evaluate((node) => getComputedStyle(node).textAlign)
  ).toBe('center');
  expect(await closing.evaluate((node) => getComputedStyle(node).rotate)).toBe(
    '180deg'
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1);
}

for (const mode of ['production', 'wedding'] as const) {
  describe(`Philosophy browser (${mode})`, () => {
    for (const lang of ['en', 'th'] as const) {
      it.each([320, 375, 767, 768, 1024, 1280])(
        `lays out ${lang} quotes at %ipx`,
        async (width) => {
          await page.setViewportSize({ width, height: 900 });
          await show({ mode, lang });
          await assertLayout(width);
          const heading = page.getByRole('heading');
          const colors = await heading.evaluate((node) => ({
            base: getComputedStyle(node).color,
            highlight: getComputedStyle(
              node.querySelector('span.dark\\:text-primary')!
            ).color,
          }));
          if (mode === 'production')
            expect(colors.highlight).not.toBe(colors.base);
          else expect(colors.highlight).toBe(colors.base);
          expect(await heading.textContent()).not.toMatch(/[\[\]]/);
          expect(await heading.textContent()).toContain('\n');
          await expect(
            page.locator('svg[data-icon-name="bi:quote"]')
          ).toHaveCount(2);
          if (lang === 'en' && [375, 1280].includes(width)) {
            const dir = resolve(root, 'play-results/philosophy');
            await mkdir(dir, { recursive: true });
            await page.screenshot({
              path: resolve(dir, `${mode}-${width}.png`),
              fullPage: true,
            });
          }
        }
      );
    }
    it('retains the base h2 line height without a component override', async () => {
      await show({ mode });
      for (const width of [375, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        const values = await page.getByRole('heading').evaluate((node) => {
          const reference = document.createElement('h2');
          reference.style.fontSize = getComputedStyle(node).fontSize;
          node.parentElement!.append(reference);
          const expected = getComputedStyle(reference).lineHeight;
          const actual = getComputedStyle(node).lineHeight;
          reference.remove();
          return { actual, expected };
        });
        expect(values.actual).toBe(values.expected);
      }
    });
    it('preserves background options, long copy, resize and empty content', async () => {
      for (const background of ['default', 'muted', 'contrast']) {
        await show({ mode, background, quote: 'Plain CMS copy' });
        const color = await page
          .getByTestId('philosophy-section')
          .evaluate((node) => getComputedStyle(node).backgroundColor);
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
      }
      await page.setViewportSize({ width: 375, height: 900 });
      await show({
        mode,
        quote: 'Long CMS copy without forced breaks. '.repeat(12),
      });
      await assertLayout(375);
      expect(
        (await page.getByRole('heading').boundingBox())!.height
      ).toBeGreaterThan(300);
      await page.setViewportSize({ width: 1280, height: 900 });
      await assertLayout(1280);
      await show({ mode, quote: '' });
      await expect(page.getByRole('heading')).toHaveCount(0);
      await expect(page.locator('[data-slot="app-icon"]')).toHaveCount(0);
    });
  });
}

it('the geometry assertion rejects an incorrect desktop icon position', async () => {
  await show();
  await assertLayout(1280);
  await page.getByTestId('philosophy-opening-quote').evaluate((node) => {
    node.style.transform = 'translateX(200px)';
  });
  await expect(assertLayout(1280)).rejects.toThrow();
});
