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
  type Locator,
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
const directory = resolve(root, 'tests/support/browser/timeline-icons');
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
    'src/features/timeline-section/TimelineSection.tsx',
    'src/features/timeline-section/components/TimelineCard.tsx',
    'src/features/timeline-section/components/desktop-animated-timeline/index.tsx',
    'src/features/timeline-section/components/desktop-animated-timeline/StepRow.tsx',
    'src/shared/components/common/AppIcon.tsx',
    'src/shared/components/common/SectionShell.tsx',
    'src/shared/components/common/section-header/index.tsx',
    'src/shared/components/common/HighlightedText.tsx',
    'src/shared/components/common/CtaGroup.tsx',
    'src/shared/components/common/CtaButton.tsx',
    'src/shared/components/ui/button.tsx',
    'src/shared/components/ui/input.tsx',
    'src/shared/components/ui/card.tsx',
    'src/shared/components/ui/carousel.tsx',
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
          find: /^@shared\/hooks$/,
          replacement: resolve(root, 'src/shared/hooks/useDeviceTier.ts'),
        },
        {
          find: '@iconify/react',
          replacement: resolve(directory, 'iconify.tsx'),
        },
        { find: 'next/link', replacement: resolve(directory, 'link.tsx') },
        {
          find: 'next/image',
          replacement: resolve(
            root,
            'tests/support/browser/logo-showcase/fixtureImage.tsx'
          ),
        },
        {
          find: '@/sanity/lib/image',
          replacement: resolve(directory, 'forbiddenMedia.ts'),
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
        name: 'TimelineFixture',
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
    channel: process.env.TIMELINE_ICONS_BROWSER_CHANNEL || undefined,
  });
});

beforeEach(async () => {
  requests = [];
  errors = [];
  context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    serviceWorkers: 'block',
    reducedMotion: 'no-preference',
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
      ':root{--font-cormorant-garamond:Arial;--font-ibm-plex-sans-thai:Arial;--font-manrope:Arial;--font-anuphan:Arial}' +
      '</style></head><body><div id="root"></div></body></html>'
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      configurable: true,
      value: 8,
    })
  );
  await page.addScriptTag({ content: script });
});
afterEach(async ({ task }) => {
  if (task.result?.state === 'fail' && page && !page.isClosed()) {
    const dir = resolve(root, 'play-results/timeline-icons');
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

async function show(
  options: {
    mode?: SiteMode;
    lang?: Locale;
    iconState?: 'on' | 'off' | 'missing';
    invalidIcon?: boolean;
  } = {}
) {
  await page.evaluate(
    (options) =>
      (
        window as unknown as {
          showTimelineFixture: (options: unknown) => void;
        }
      ).showTimelineFixture(options),
    options
  );
  await expect(page.getByTestId('timeline-section')).toBeVisible();
}

/** Assert real geometry, not utility names: above/centered on Mobile, beside on Desktop. */
async function assertIconPlacement(card: Locator, desktop: boolean) {
  const icon = await card.locator('[data-slot="app-icon"]').boundingBox();
  const title = await card.locator('h3').boundingBox();
  if (!icon || !title) throw new Error('Missing icon/title geometry.');
  expect(icon.width).toBeCloseTo(48, 0);
  expect(icon.height).toBeCloseTo(48, 0);
  if (desktop) {
    expect(icon.x + icon.width).toBeLessThanOrEqual(title.x + 1);
    expect(
      Math.abs(icon.y + icon.height / 2 - title.y - title.height / 2)
    ).toBeLessThanOrEqual(1);
  } else {
    expect(icon.y + icon.height).toBeLessThanOrEqual(title.y + 1);
    expect(
      Math.abs(icon.x + icon.width / 2 - title.x - title.width / 2)
    ).toBeLessThanOrEqual(1);
  }
  const bounds = await card.boundingBox();
  if (!bounds) throw new Error('Missing card bounds.');
  expect(title.x).toBeGreaterThanOrEqual(bounds.x);
  expect(title.x + title.width).toBeLessThanOrEqual(
    bounds.x + bounds.width + 1
  );
}

async function noPageOverflow() {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1);
}

for (const mode of ['production', 'wedding'] as const) {
  describe(`Timeline icons browser (${mode})`, () => {
    for (const lang of ['en', 'th'] as const) {
      it.each([320, 375, 767, 768, 1024, 1280])(
        `positions icons with long ${lang} titles at %ipx`,
        async (width) => {
          await page.setViewportSize({ width, height: 900 });
          await show({ mode, lang });
          const desktop = width >= 768;
          const layout = page.getByTestId(
            desktop ? 'timeline-desktop' : 'timeline-mobile'
          );
          await expect(layout).toBeVisible();
          await expect(
            page.getByTestId(desktop ? 'timeline-mobile' : 'timeline-desktop')
          ).toBeHidden();
          await expect(layout.locator('[data-slot="app-icon"]')).toHaveCount(4);
          const cards = layout.getByTestId('timeline-card');
          await assertIconPlacement(cards.nth(0), desktop);
          await assertIconPlacement(cards.nth(1), desktop);
          expect(
            await cards
              .locator('[data-icon-name]')
              .evaluateAll((icons) =>
                icons.map((icon) => icon.getAttribute('data-icon-name'))
              )
          ).toEqual([1, 2, 3, 4].map((order) => `mdi:camera-${order}`));
          await expect(layout.getByRole('img')).toHaveCount(0);
          await expect(page.getByRole('link')).toHaveAttribute(
            'href',
            `/${lang}/${mode}/contact`
          );
          await noPageOverflow();
          if (lang === 'en' && [375, 1280].includes(width)) {
            const dir = resolve(root, 'play-results/timeline-icons');
            await mkdir(dir, { recursive: true });
            await page
              .getByTestId('timeline-section')
              .screenshot({ path: resolve(dir, `${mode}-${width}.png`) });
          }
        }
      );
    }

    it.each([375, 1024])(
      'removes all icon slots while preserving off/missing layout at %ipx',
      async (width) => {
        await page.setViewportSize({ width, height: 900 });
        const layout = page.getByTestId(
          width >= 768 ? 'timeline-desktop' : 'timeline-mobile'
        );
        await show({ mode, iconState: 'on' });
        await expect(layout.locator('[data-slot="app-icon"]')).toHaveCount(4);
        await show({ mode, iconState: 'off' });
        await expect(page.locator('[data-slot="app-icon"]')).toHaveCount(0);
        const headerGeometry = () =>
          layout
            .getByTestId('timeline-card')
            .first()
            .evaluate((card) => {
              const title = card.querySelector('h3')!;
              const header = title.parentElement!;
              return {
                titleY:
                  title.getBoundingClientRect().y -
                  header.getBoundingClientRect().y,
                headerHeight: header.getBoundingClientRect().height,
                titleHeight: title.getBoundingClientRect().height,
                children: header.children.length,
              };
            });
        const off = await headerGeometry();
        expect(off.children).toBe(1);
        expect(
          Math.abs(off.headerHeight - off.titleHeight)
        ).toBeLessThanOrEqual(1);
        await show({ mode, iconState: 'missing' });
        await expect(page.locator('[data-slot="app-icon"]')).toHaveCount(0);
        expect(await headerGeometry()).toEqual(off);
        await show({ mode, iconState: 'on' });
        await expect(layout.locator('[data-slot="app-icon"]')).toHaveCount(4);
        await noPageOverflow();
      }
    );

    it('keeps the real Mobile carousel interactive after toggling icons', async () => {
      await page.setViewportSize({ width: 375, height: 900 });
      await show({ mode });
      const mobile = page.getByTestId('timeline-mobile');
      const carousel = mobile.locator('[data-slot="carousel"]');
      const track = mobile.locator('[data-slot="carousel-content"] > div');
      await expect
        .poll(() =>
          track.evaluate((element) => (element as HTMLElement).style.transform)
        )
        .toContain('translate');
      const before = await track.evaluate(
        (element) => (element as HTMLElement).style.transform
      );
      await carousel.dispatchEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
      });
      await expect
        .poll(() =>
          track.evaluate((element) => (element as HTMLElement).style.transform)
        )
        .not.toBe(before);
      await show({ mode, iconState: 'off' });
      await expect(page.locator('[data-slot="app-icon"]')).toHaveCount(0);
      // Real pointer dragging should still move Embla after the icon update.
      const viewport = mobile.locator('[data-slot="carousel-content"]');
      const box = await viewport.boundingBox();
      if (!box) throw new Error('Missing carousel viewport.');
      const current = await track.evaluate(
        (element) => (element as HTMLElement).style.transform
      );
      await page.mouse.move(box.x + box.width * 0.8, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.2, box.y + 100, {
        steps: 12,
      });
      await page.mouse.up();
      await expect
        .poll(() =>
          track.evaluate((element) => (element as HTMLElement).style.transform)
        )
        .not.toBe(current);
      await noPageOverflow();
    });

    it('keeps icons visible through resize and reactive reduced-motion changes', async () => {
      await show({ mode, lang: 'th' });
      const desktop = page.getByTestId('timeline-desktop');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(desktop.locator('[data-slot="app-icon"]')).toHaveCount(4);
      await assertIconPlacement(
        desktop.getByTestId('timeline-card').first(),
        true
      );
      await page.setViewportSize({ width: 375, height: 900 });
      const mobile = page.getByTestId('timeline-mobile');
      await expect(mobile).toBeVisible();
      await assertIconPlacement(
        mobile.getByTestId('timeline-card').first(),
        false
      );
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect(mobile.locator('[data-slot="app-icon"]')).toHaveCount(4);
      await noPageOverflow();
    });
    it('does not crash or display a legacy image when a picker is missing', async () => {
      await show({ mode, invalidIcon: true });
      await expect(
        page.getByTestId('timeline-desktop').locator('[data-slot="app-icon"]')
      ).toHaveCount(3);
      await expect(
        page
          .getByTestId('timeline-desktop')
          .getByTestId('timeline-card')
          .first()
          .locator('h3')
      ).toBeVisible();
      await expect(page.locator('img')).toHaveCount(0);
    });
  });
}

it('rejects a deliberately broken icon layout in the browser fixture', async () => {
  await page.setViewportSize({ width: 375, height: 900 });
  await show();
  const card = page
    .getByTestId('timeline-mobile')
    .getByTestId('timeline-card')
    .first();
  await assertIconPlacement(card, false);
  await card.locator('h3').evaluate((title) => {
    title.parentElement!.style.flexDirection = 'row';
  });
  await expect(assertIconPlacement(card, false)).rejects.toThrow();
});
