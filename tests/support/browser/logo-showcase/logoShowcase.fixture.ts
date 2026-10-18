import { readFile, mkdir } from 'node:fs/promises';
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
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
  describe,
  it,
} from 'vitest';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const fixtureDir = resolve(root, 'tests/support/browser/logo-showcase');
let browser: Browser, context: BrowserContext, page: Page;
let css: string, script: string;
let requests: string[];

beforeAll(async () => {
  const require = createRequire(import.meta.url);
  // Resolve Vitest's own Vite dependency, as with Tailwind's owned PostCSS below.
  const { build } = await import(
    createRequire(require.resolve('vitest/package.json')).resolve('vite')
  );
  const postcss = createRequire(require.resolve('@tailwindcss/postcss'))(
    'postcss'
  );
  const stylesheet = resolve(root, 'src/app/globals.css');
  const sources = [
    'src/features/logo-showcase-section/LogoShowcaseSection.tsx',
    'src/features/logo-showcase-section/components/LogoShowcaseLogos.tsx',
    'src/shared/components/common/LogoLoop.tsx',
    'src/shared/components/common/SectionShell.tsx',
    'src/shared/components/common/section-header/index.tsx',
    'src/shared/components/common/HighlightedText.tsx',
    'src/shared/components/ui/button.tsx',
    'src/shared/components/ui/input.tsx',
    'src/shared/utils/styling/styleVariants.ts',
  ];
  const original = await readFile(stylesheet, 'utf8');
  const scoped = original.replace(
    /@import ['"]tailwindcss['"];/,
    '@import "tailwindcss" source(none);\n' +
      sources
        .map(
          (file) =>
            '@source "' + resolve(root, file).replaceAll('\\', '/') + '";'
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
    configFile: false,
    envFile: false,
    root,
    logLevel: 'error',
    plugins: [react()],
    // Vitest uses NODE_ENV=test; compile production JSX to match the bundled runtime.
    oxc: { jsx: { development: false } },
    resolve: {
      alias: [
        {
          find: /^@shared\/components$/,
          replacement: resolve(fixtureDir, 'fixtureComponents.tsx'),
        },
        {
          find: 'next/image',
          replacement: resolve(fixtureDir, 'fixtureImage.tsx'),
        },
        {
          find: '@/sanity/lib/image',
          replacement: resolve(fixtureDir, 'fixtureImageUrl.ts'),
        },
        { find: '@features', replacement: resolve(root, 'src/features') },
        { find: '@shared', replacement: resolve(root, 'src/shared') },
        { find: '@', replacement: resolve(root, 'src') },
      ],
    },
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    build: {
      write: false,
      lib: {
        entry: resolve(fixtureDir, 'entry.tsx'),
        name: 'LogoFixture',
        formats: ['iife'],
      },
    },
  });
  const output = Array.isArray(result) ? result[0] : result;
  if (!('output' in output))
    throw new Error('Fixture bundler did not return output.');
  script = output.output
    .filter((chunk: { type: string }) => chunk.type === 'chunk')
    .map((chunk: { code: string }) => chunk.code)
    .join('\n');
  browser = await chromium.launch({
    headless: true,
    channel: process.env.LOGO_SHOWCASE_BROWSER_CHANNEL || undefined,
  });
});
beforeEach(async () => {
  requests = [];
  context = await browser.newContext({
    serviceWorkers: 'block',
    reducedMotion: 'no-preference',
    hasTouch: true,
  });
  await context.addInitScript(() =>
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8 })
  );
  await context.route('**/*', (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  page = await context.newPage();
  await page.setContent(
    '<!doctype html><html><head><style>' +
      css +
      ':root {--font-cormorant-garamond:Arial;--font-ibm-plex-sans-thai:Arial;--font-manrope:Arial;--font-anuphan:Arial}</style></head><body><div id="root"></div></body></html>'
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8 })
  );
  await page.addScriptTag({ content: script });
});
afterEach(async ({ task }) => {
  if (task.result?.state === 'fail' && page && !page.isClosed()) {
    const dir = resolve(root, 'play-results/logo-showcase');
    await mkdir(dir, { recursive: true });
    await page.screenshot({
      path: resolve(dir, task.id + '.png'),
      fullPage: true,
    });
  }
  await context?.close();
});
afterAll(async () => {
  await browser?.close();
});

/** Render the offline fixture with the requested options and wait until visible. */
async function show(
  options: {
    count?: number;
    mode?: string;
    lang?: string;
    hydrate?: boolean;
  } = {}
) {
  await page.evaluate(
    (options) => (window as any).showLogoFixture(options),
    options
  );
  await expect(page.getByTestId('logo-showcase-section')).toBeVisible();
}
/** Read each animated track's inline transform to observe its current position. */
async function tracks() {
  return page
    .locator('[data-testid="logo-showcase-loops"] [role="region"] > div')
    .evaluateAll((elements) =>
      elements.map((element) => (element as HTMLElement).style.transform)
    );
}
/** Wait until the animated track transforms differ from their initial values. */
async function waitForTravel() {
  const before = await tracks();
  await expect.poll(tracks).not.toEqual(before);
}
/** Assert overflow stays within one pixel and no external requests were made. */
async function noOverflow() {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1);
  expect(requests).toEqual([]);
}

describe.each(['production', 'wedding'])(
  'Logo Showcase browser (%s)',
  (mode) => {
    it.each([320, 375, 768, 1280])(
      'loops and fades without overflow at %ipx',
      async (width) => {
        await page.setViewportSize({ width, height: 900 });
        await show({ mode });
        const regions = page
          .getByTestId('logo-showcase-loops')
          .getByRole('region');
        await expect(regions).toHaveCount(2);
        await waitForTravel();
        expect(
          await regions.evaluateAll((elements) =>
            elements.map((element) => getComputedStyle(element).maskImage)
          )
        ).toEqual([
          expect.stringContaining('linear-gradient'),
          expect.stringContaining('linear-gradient'),
        ]);
        await expect(page.getByRole('img')).toHaveCount(13);
        const typography = await page.evaluate(() => {
          const actual = document.querySelector(
            '[data-testid="logo-showcase-section"] header'
          )!;
          const reference = document.querySelector(
            '#typography-reference header'
          )!;
          return ['span', 'h2', 'p'].map((selector) => [
            getComputedStyle(actual.querySelector(selector)!).fontSize,
            getComputedStyle(reference.querySelector(selector)!).fontSize,
          ]);
        });
        typography.forEach(([actual, expected]) =>
          expect(actual).toBe(expected)
        );
        if (width === 375 || width === 1280) {
          await expect
            .poll(() =>
              regions
                .locator('li')
                .evaluateAll((items) =>
                  items.every((item) => getComputedStyle(item).opacity === '1')
                )
            )
            .toBe(true);
          const dir = resolve(root, 'play-results/logo-showcase');
          await mkdir(dir, { recursive: true });
          await page
            .getByTestId('logo-showcase-section')
            .screenshot({ path: resolve(dir, `${mode}-${width}.png`) });
        }
        await noOverflow();
      }
    );
    it('pauses both tracks, stays paused after hover, and resumes without replacing roots', async () => {
      await show({ mode });
      await waitForTravel();
      // Observe the same roots, not new loops with reset offsets.
      await page
        .locator('[role="region"]')
        .evaluateAll((elements) =>
          elements.forEach((element) =>
            element.setAttribute('data-fixture-identity', 'original')
          )
        );
      await page.getByRole('button', { name: 'Pause logo animation' }).click();
      await expect(page.locator('[data-paused]')).toHaveCount(2);
      await page.waitForTimeout(100);
      const stopped = await tracks();
      await page.waitForTimeout(250);
      expect(await tracks()).toEqual(stopped);
      await page.getByRole('region').first().hover();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
      expect(await tracks()).toEqual(stopped);
      await page.getByRole('button', { name: 'Play logo animation' }).click();
      await waitForTravel();
      await expect(
        page.locator('[data-fixture-identity="original"]')
      ).toHaveCount(2);
      await page.setViewportSize({ width: 375, height: 900 });
      await waitForTravel();
      await noOverflow();
    });
    it('shows all logos from the first reduced-motion paint through hydration', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await show({ mode, count: 20, hydrate: false });
      await expect(page.getByRole('img')).toHaveCount(20);
      expect(
        await page
          .getByTestId('logo-showcase-static')
          .locator('ul')
          .first()
          .evaluate((element) => getComputedStyle(element).display)
      ).toBe('grid');
      await page.evaluate(() => (window as any).hydrateLogoFixture());
      await expect(page.getByRole('button')).toHaveCount(0);
      await expect(page.getByTestId('logo-showcase-loops')).toHaveCount(0);
      await noOverflow();
    });
  }
);

it('responds live to reduced motion and preserves manual pause across the change', async () => {
  await show({ lang: 'th' });
  await waitForTravel();
  await page.getByRole('button', { name: 'หยุดภาพเคลื่อนไหวโลโก้' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByTestId('logo-showcase-loops')).toHaveCount(0);
  await expect(page.getByRole('button')).toHaveCount(0);
  await expect(page.getByRole('img')).toHaveCount(13);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(
    page.getByRole('button', { name: 'เล่นภาพเคลื่อนไหวโลโก้' })
  ).toHaveAttribute('aria-pressed', 'true');
  await noOverflow();
});

it('moves the two rows in opposite directions at approximately 20px per second', async () => {
  await show();
  await waitForTravel();
  const sample = () =>
    page
      .getByTestId('logo-showcase-loops')
      .locator('[role="region"] > div')
      .evaluateAll((elements) => ({
        time: performance.now(),
        positions: elements.map((element) =>
          Number(
            (element as HTMLElement).style.transform.match(
              /translate3d\(([-\d.]+)px/
            )![1]
          )
        ),
      }));
  await page.waitForTimeout(1000);
  const before = await sample();
  await page.waitForTimeout(600);
  const after = await sample();
  const velocities = after.positions.map(
    (position, index) =>
      ((position - before.positions[index]) / (after.time - before.time)) * 1000
  );
  expect(velocities[0]).toBeGreaterThan(16);
  expect(velocities[0]).toBeLessThan(24);
  expect(velocities[1]).toBeLessThan(-16);
  expect(velocities[1]).toBeGreaterThan(-24);
});

it('keeps SSR fallback and hydrated loop geometry close', async () => {
  await page.setViewportSize({ width: 375, height: 900 });
  await show({ hydrate: false });
  const before = (await page
    .getByTestId('logo-showcase-section')
    .boundingBox())!;
  await page.evaluate(() => (window as any).hydrateLogoFixture());
  await expect(page.getByTestId('logo-showcase-loops')).toBeVisible();
  const after = (await page
    .getByTestId('logo-showcase-section')
    .boundingBox())!;
  expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(8);
  await noOverflow();
});

it('keeps continuous travel across a full repeat and allows horizontal drag', async () => {
  await page.setViewportSize({ width: 375, height: 900 });
  await show({ count: 1 });
  await waitForTravel();
  const region = page.getByRole('region').first();
  await expect
    .poll(async () =>
      region
        .locator(':scope > div')
        .evaluate((element) =>
          Number(element.getAttribute('style')?.includes('translate3d'))
        )
    )
    .toBe(1);
  const samples: number[] = [];
  for (let i = 0; i < 25; i++) {
    const transform = (await tracks())[0];
    samples.push(Number(transform.match(/translate3d\(([-\d.]+)px/)![1]));
    const visibleImages = await region.locator('img').evaluateAll((images) => {
      const bounds = images[0]
        .closest('[role="region"]')!
        .getBoundingClientRect();
      return images.filter((image) => {
        const rect = image.getBoundingClientRect();
        return rect.right > bounds.left && rect.left < bounds.right;
      }).length;
    });
    expect(
      visibleImages,
      'no empty seam in the visible logo track'
    ).toBeGreaterThanOrEqual(2);
    await page.waitForTimeout(400);
  }
  // One logo has a 168px period and travels right at 20px/s, so this spans a seam.
  expect(
    samples.some((value, i) => i > 0 && value < samples[i - 1] - 100)
  ).toBe(true);
  expect(samples.every(Number.isFinite)).toBe(true);
  const box = (await region.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 15, box.y + box.height / 2);
  await expect(region).toHaveAttribute('data-dragging', '');
  await page.mouse.move(box.x + box.width / 2 - 80, box.y + box.height / 2);
  await page.mouse.up();
  await expect(region).not.toHaveAttribute('data-dragging');
  expect(
    await region.evaluate((element) => getComputedStyle(element).touchAction)
  ).toContain('pan-y');
  await noOverflow();
});

it('allows vertical touch scrolling that starts on a draggable logo row', async () => {
  await page.setViewportSize({ width: 375, height: 900 });
  await show();
  await waitForTravel();
  const bounds = (await page.getByRole('region').first().boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + bounds.height / 2;
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 6; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: y - i * 25 }],
    });
    await page.waitForTimeout(30);
  }
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(30);
  await expect(page.locator('[data-dragging]')).toHaveCount(0);
  await noOverflow();
});
