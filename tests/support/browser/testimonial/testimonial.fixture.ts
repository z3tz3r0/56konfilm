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
const directory = resolve(root, 'tests/support/browser/testimonial');
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
    'src/features/testimonial-section/components/TestimonialSection.tsx',
    'src/shared/components/common/AppIcon.tsx',
    'src/shared/components/common/HighlightedText.tsx',
    'src/shared/components/common/SectionShell.tsx',
    'src/shared/components/common/section-header/index.tsx',
    'src/shared/components/common/section-header/EmphasizedHeader.tsx',
    'src/shared/components/ui/carousel.tsx',
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
          replacement: resolve(
            root,
            'tests/support/browser/philosophy/iconify.tsx'
          ),
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
            'tests/support/browser/testimonial/media.ts'
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
        name: 'TestimonialFixture',
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
    channel: process.env.TESTIMONIAL_BROWSER_CHANNEL || undefined,
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
    const dir = resolve(root, 'play-results/testimonial');
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

interface Options {
  mode?: SiteMode;
  lang?: Locale;
  background?: string;
  count?: number;
  minimal?: boolean;
}

async function show(options: Options = {}) {
  await page.evaluate(
    (options) =>
      (
        window as unknown as {
          showTestimonialFixture: (options: Options) => Promise<void>;
        }
      ).showTestimonialFixture(options),
    options
  );
  await expect(page.getByTestId('testimonial-section')).toBeVisible();
  if (options.count === 0) {
    await expect(page.locator('article')).toHaveCount(0);
    return;
  }
  await expect(page.locator('article')).toHaveCount(options.count ?? 3);
  await settleCard();
}

async function settleCard() {
  await expect
    .poll(() =>
      page
        .getByTestId('testimonial-item')
        .evaluate((node) => Number(getComputedStyle(node).opacity))
    )
    .toBe(1);
}

/** Compare computed colors against resolved theme variables, including inheritance. */
async function assertColors(mode: SiteMode) {
  const cards = await page.locator('article').evaluateAll((nodes) =>
    nodes.map((node) => {
      const paragraphs = node.querySelectorAll('p');
      const icon = node.querySelector('[data-slot="app-icon"]')!;
      const probe = document.createElement('span');
      node.append(probe);
      probe.style.backgroundColor = 'var(--neutral)';
      probe.style.color = 'var(--neutral-foreground)';
      const neutral = getComputedStyle(probe).backgroundColor;
      const foreground = getComputedStyle(probe).color;
      probe.style.color = 'var(--neutral-foreground-secondary)';
      const secondary = getComputedStyle(probe).color;
      probe.style.color = 'var(--primary)';
      const primary = getComputedStyle(probe).color;
      probe.remove();
      return {
        background: getComputedStyle(node).backgroundColor,
        quote: getComputedStyle(paragraphs[0]).color,
        name: getComputedStyle(paragraphs[1]).color,
        title: getComputedStyle(paragraphs[2]).color,
        icon: getComputedStyle(icon).color,
        iconOpacity: getComputedStyle(icon).opacity,
        iconBackground: getComputedStyle(icon).backgroundColor,
        neutral,
        foreground,
        secondary,
        primary,
      };
    })
  );
  for (const card of cards) {
    expect(card.background).toBe(card.neutral);
    expect(card.quote).toBe(card.foreground);
    expect(card.name).toBe(card.foreground);
    expect(card.title).toBe(card.secondary);
    expect(card.icon).toBe(card.primary);
    expect(card.iconOpacity).toBe('1');
    expect(card.iconBackground).toBe('rgba(0, 0, 0, 0)');
    if (mode === 'production') expect(card.title).not.toBe(card.quote);
    else expect(card.title).toBe(card.quote);
  }
}

async function assertGeometry() {
  const card = page.getByTestId('testimonial-item');
  const icon = card.locator('[data-slot="app-icon"]');
  const [bounds, glyph, quote] = await Promise.all([
    card.boundingBox(),
    icon.boundingBox(),
    card.locator('p').first().boundingBox(),
  ]);
  if (!bounds || !glyph || !quote)
    throw new Error('Missing testimonial geometry.');
  expect(glyph.width).toBeCloseTo(48, 0);
  expect(glyph.height).toBeCloseTo(48, 0);
  expect(
    Math.abs(glyph.x + glyph.width / 2 - bounds.x - bounds.width / 2)
  ).toBeLessThanOrEqual(1);
  expect(glyph.y + glyph.height).toBeLessThanOrEqual(quote.y);
  await expect(card.locator('[data-slot="app-icon"]')).toHaveCount(1);
  await expect(icon.locator('svg')).toHaveAttribute(
    'data-icon-name',
    'bi:quote'
  );
  await expect(icon.locator('..')).toHaveAttribute('aria-hidden', 'true');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1);
}

for (const mode of ['production', 'wedding'] as const) {
  describe('Testimonial browser (' + mode + ')', () => {
    for (const lang of ['en', 'th'] as const) {
      for (const background of ['default', 'muted', 'contrast']) {
        it.each([375, 1280])(
          'uses themed colors for ' + lang + '/' + background + ' at %ipx',
          async (width) => {
            await page.setViewportSize({ width, height: 900 });
            await show({ mode, lang, background });
            await assertColors(mode);
            await assertGeometry();
            const section = page.getByTestId('testimonial-section');
            const expectedBackground = await section.evaluate(
              (node, background) => {
                const probe = document.createElement('span');
                node.append(probe);
                probe.style.backgroundColor =
                  'var(' +
                  (background === 'default'
                    ? '--background'
                    : background === 'muted'
                      ? '--secondary'
                      : '--primary') +
                  ')';
                const expected = getComputedStyle(probe).backgroundColor;
                probe.remove();
                return expected;
              },
              background
            );
            expect(
              await section.evaluate(
                (node) => getComputedStyle(node).backgroundColor
              )
            ).toBe(expectedBackground);
            await expect(section.getByRole('heading')).toHaveText(
              lang === 'th' ? 'เสียงจากลูกค้า' : 'What our clients say'
            );
            if (background === 'default' && lang === 'en') {
              const directory = resolve(root, 'play-results/testimonial');
              await mkdir(directory, { recursive: true });
              await page.screenshot({
                path: resolve(directory, mode + '-' + width + '.png'),
                fullPage: true,
              });
            }
          }
        );
      }
    }
    it.each([375, 1280])(
      'preserves real carousel navigation at %ipx',
      async (width) => {
        await page.setViewportSize({ width, height: 900 });
        await show({ mode });
        await expect(page.getByTestId('testimonial-item')).toContainText(
          'Reviewer 1'
        );
        if (width === 1280) {
          await page.getByTestId('carousel-next').click();
          await expect(page.getByTestId('testimonial-item')).toContainText(
            'Reviewer 2'
          );
          await page.getByTestId('carousel-prev').click();
          await expect(page.getByTestId('testimonial-item')).toContainText(
            'Reviewer 1'
          );
        } else {
          await page
            .getByRole('button', { name: 'Go to testimonial 2' })
            .click();
          await expect(page.getByTestId('testimonial-item')).toContainText(
            'Reviewer 2'
          );
        }
        await page.getByRole('button', { name: 'Go to testimonial 3' }).click();
        await expect(page.getByTestId('testimonial-item')).toContainText(
          'Reviewer 3'
        );
        await settleCard();
        await assertColors(mode);
        await assertGeometry();
        // Match the pre-existing current-card opacity class without changing Motion.
        await expect(page.getByTestId('testimonial-item')).toHaveClass(
          /opacity-100/
        );
      }
    );
    it('handles empty, single and optional content', async () => {
      await show({ mode, count: 0 });
      await expect(page.getByRole('region')).toHaveCount(0);
      await expect(page.getByRole('heading')).toHaveCount(1);
      await show({ mode, count: 1 });
      await expect(
        page.getByRole('button', { name: /Go to testimonial/ })
      ).toHaveCount(0);
      await assertColors(mode);
      await assertGeometry();
      await show({ mode, count: 1, minimal: true });
      await expect(page.locator('article p')).toHaveCount(0);
      await expect(page.locator('article img')).toHaveCount(0);
      await expect(page.locator('article [data-slot="app-icon"]')).toHaveCount(
        1
      );
    });
    it('keeps the icon centered after responsive resize without adding overflow', async () => {
      await show({ mode });
      for (const width of [320, 767, 768, 1024]) {
        await page.setViewportSize({ width, height: 900 });
        await assertGeometry();
      }
    });
  });
}

it('color assertions detect a foreground regression on neutral cards', async () => {
  await show({ mode: 'production' });
  await assertColors('production');
  await page
    .locator('article p')
    .first()
    .evaluate((node) => {
      node.style.color = 'transparent';
    });
  await expect(assertColors('production')).rejects.toThrow();
});
