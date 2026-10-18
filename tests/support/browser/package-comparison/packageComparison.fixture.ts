import { readFile } from 'node:fs/promises';
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
const directory = resolve(root, 'tests/support/browser/package-comparison');
let browser: Browser, context: BrowserContext, page: Page;
let script: string, css: string;
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
  const original = await readFile(stylesheet, 'utf8');
  const sources = [
    'src/features/package-comparison-section/PackageComparisonSection.tsx',
    'src/features/package-comparison-section/components/PackageComparison.tsx',
    'src/features/package-comparison-section/components/PackageHeader.tsx',
    'src/features/package-comparison-section/components/PackageGroupControls.tsx',
    'src/features/package-comparison-section/components/ComparisonScrollport.tsx',
    'src/features/package-comparison-section/components/ComparisonStickyHeader.tsx',
    'src/shared/components/common/SectionShell.tsx',
    'src/shared/components/common/section-header/index.tsx',
    'src/shared/components/common/CtaButton.tsx',
    'src/shared/components/common/AppTooltip.tsx',
    'src/shared/components/ui/tabs.tsx',
    'src/shared/components/ui/select.tsx',
    'src/shared/components/ui/table.tsx',
    'src/shared/components/ui/button.tsx',
    'src/shared/components/ui/badge.tsx',
    'src/shared/components/ui/popover.tsx',
    'src/shared/components/ui/tooltip.tsx',
    'src/shared/components/ui/input.tsx',
    'src/shared/utils/styling/styleVariants.ts',
  ];
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
    root,
    configFile: false,
    envFile: false,
    logLevel: 'error',
    plugins: [react()],
    oxc: { jsx: { development: false } },
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    // CSS Modules still compile, without loading the application's PostCSS configuration.
    css: { postcss: { plugins: [] } },
    resolve: {
      alias: [
        {
          find: /^@shared\/components(?:\/ui)?$/,
          replacement: resolve(directory, 'components.tsx'),
        },
        {
          find: /^@shared\/hooks$/,
          replacement: resolve(root, 'src/shared/hooks/useDeviceTier.ts'),
        },
        {
          find: 'next/navigation',
          replacement: resolve(directory, 'navigation.tsx'),
        },
        {
          find: 'next/link',
          replacement: resolve(directory, 'navigation.tsx'),
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
            'tests/support/browser/logo-showcase/fixtureImageUrl.ts'
          ),
        },
        { find: '@shared', replacement: resolve(root, 'src/shared') },
        { find: '@features', replacement: resolve(root, 'src/features') },
      ],
    },
    build: {
      write: false,
      lib: {
        entry: resolve(directory, 'entry.tsx'),
        name: 'ComparisonFixture',
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
  css += output.output
    .filter(
      (item: { type: string; fileName: string }) =>
        item.type === 'asset' && item.fileName.endsWith('.css')
    )
    .map((item: { source: string | Uint8Array }) =>
      typeof item.source === 'string'
        ? item.source
        : new TextDecoder().decode(item.source)
    )
    .join('\n');
  browser = await chromium.launch({
    headless: true,
    channel: process.env.COMPARISON_BROWSER_CHANNEL || undefined,
  });
});

beforeEach(async () => {
  requests = [];
  errors = [];
  context = await browser.newContext({
    reducedMotion: 'no-preference',
    serviceWorkers: 'block',
    viewport: { width: 1280, height: 900 },
  });
  await context.route('**/*', (route) => {
    if (
      route.request().isNavigationRequest() &&
      route.request().url().startsWith('http://comparison.fixture/')
    ) {
      return route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><div id="root"></div>',
      });
    }
    requests.push(route.request().url());
    return route.abort();
  });
  page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://comparison.fixture/en/wedding/packages?keep=1');
  await page.addStyleTag({
    content:
      css +
      ':root{--font-cormorant-garamond:Arial;--font-ibm-plex-sans-thai:Arial;--font-manrope:Arial;--font-anuphan:Arial}',
  });
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      configurable: true,
      value: 8,
    })
  );
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

/**
 * Mounts the offline comparison fixture for a locale and mode, then waits for
 * policy initialization.
 */
async function show(lang: Locale = 'en', mode: SiteMode = 'wedding') {
  await page.evaluate(
    (options) =>
      (
        window as typeof window & {
          showComparisonFixture: (options: {
            lang: Locale;
            mode: SiteMode;
          }) => void;
        }
      ).showComparisonFixture(options),
    { lang, mode }
  );
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('device-policy')).toContainText(
    '"isInitialized":true'
  );
}

/** Sample real layout projection over frames rather than testing layoutId props. */
async function switchGroup(label: string) {
  await page.evaluate(async () => {
    // Let the measured tabs presentation commit its initial projection before clicking.
    for (let frame = 0; frame < 6; frame++)
      await new Promise(requestAnimationFrame);
  });
  const tab = page.getByRole('tab', { name: label, exact: true });
  // Radix Tabs activates on pointer down, not a synthetic HTMLElement.click().
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
  return page.evaluate(async () => {
    const samples: number[] = [];
    for (let frame = 0; frame < 24; frame++) {
      await new Promise(requestAnimationFrame);
      const highlight = document.querySelector<HTMLElement>(
        '[data-testid="comparison-group-highlight"]'
      )!;
      samples.push(
        Math.abs(
          highlight.getBoundingClientRect().x -
            highlight.parentElement!.getBoundingClientRect().x
        )
      );
    }
    return Math.max(...samples);
  });
}

/** Native smooth scrolling starts asynchronously; auto scrolling reaches its target immediately. */
async function checkScroll(reduced: boolean, lang: Locale = 'en') {
  const scrollport = page.getByTestId('comparison-scrollport');
  await scrollport.evaluate((element) => {
    element.scrollLeft = 0;
  });
  const right = page.getByRole('button', {
    name: lang === 'th' ? 'เลื่อนตารางไปทางขวา' : 'Scroll comparison right',
  });
  await expect(right).toBeEnabled();
  const sample = await right.evaluate((button) => {
    const element = document.querySelector<HTMLElement>(
      '[data-testid="comparison-scrollport"]'
    )!;
    (button as HTMLButtonElement).click();
    return {
      position: element.scrollLeft,
      target: Math.min(
        element.clientWidth * 0.8,
        element.scrollWidth - element.clientWidth
      ),
    };
  });
  if (reduced)
    expect(Math.abs(sample.position - sample.target)).toBeLessThanOrEqual(1);
  else {
    expect(sample.position).toBe(0);
    await expect
      .poll(() => scrollport.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(2);
  }
}

describe.each([
  ['production', 'en'],
  ['production', 'th'],
  ['wedding', 'en'],
  ['wedding', 'th'],
] as const)('Comparison motion (%s/%s)', (mode, lang) => {
  it('updates real tab animation and scroll behavior without resetting the selected group or URL', async () => {
    await show(lang, mode);
    const luxury = lang === 'th' ? 'พรีเมียม' : 'Luxury';
    const budget = lang === 'th' ? 'คุ้มค่า' : 'Budget friendly';
    await expect(page.getByRole('tablist')).toBeVisible();
    expect(await switchGroup(luxury)).toBeGreaterThan(1);
    const scrollport = page.getByTestId('comparison-scrollport');
    await scrollport.evaluate((element) => {
      element.scrollLeft = 170;
    });
    const url = page.url();
    const y = await page.evaluate(() => window.scrollY);
    const cta = page
      .getByRole('link', { name: lang === 'th' ? 'เริ่มต้น' : 'Get started' })
      .first();
    await cta.evaluate((element) => element.focus({ preventScroll: true }));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.getByTestId('device-policy')).toContainText(
      '"prefersReducedMotion":true'
    );
    await expect(cta).toBeFocused();
    expect(page.url()).toBe(url);
    expect(await page.evaluate(() => window.scrollY)).toBe(y);
    expect(await scrollport.evaluate((element) => element.scrollLeft)).toBe(
      170
    );
    await expect(page.getByRole('tab', { name: luxury })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(await switchGroup(budget)).toBeLessThan(1);
    await checkScroll(true, lang);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.getByTestId('device-policy')).toContainText(
      '"allowHeavyMotion":true'
    );
    expect(await switchGroup(luxury)).toBeGreaterThan(1);
    await checkScroll(false, lang);
    await page.evaluate(() => {
      window.history.pushState(
        {},
        '',
        '?keep=1&package-group-comparison=budget-friendly'
      );
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(page.getByRole('tab', { name: budget })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await page.goBack();
    await expect(page.getByRole('tab', { name: luxury })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await page.goForward();
    await expect(page.getByRole('tab', { name: budget })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('preserves mobile selection, sticky geometry, horizontal sync and CTA focus during changes', async () => {
    await page.setViewportSize({ width: 375, height: 900 });
    await show(lang, mode);
    const select = page.getByRole('combobox');
    await select.click();
    await page
      .getByRole('option', { name: lang === 'th' ? 'พรีเมียม' : 'Luxury' })
      .click();
    const scrollport = page.getByTestId('comparison-scrollport');
    await scrollport.evaluate((element) =>
      window.scrollTo(
        0,
        element.getBoundingClientRect().top + window.scrollY + 30
      )
    );
    const header = page.getByTestId('comparison-sticky-header');
    await expect(header).toHaveAttribute('data-active', 'true');
    await scrollport.evaluate((element) => {
      element.scrollLeft = 600;
    });
    const stickyScroll = page.getByTestId('comparison-sticky-scrollport');
    await expect
      .poll(() => stickyScroll.evaluate((element) => element.scrollLeft))
      .toBe(600);
    const cta = header
      .getByRole('link', { name: lang === 'th' ? 'เริ่มต้น' : 'Get started' })
      .first();
    await cta.evaluate((element) => element.focus({ preventScroll: true }));
    const url = page.url();
    const geometry = await header.boundingBox();
    const y = await page.evaluate(() => window.scrollY);
    for (const reducedMotion of ['reduce', 'no-preference'] as const) {
      await page.emulateMedia({ reducedMotion });
      await expect(page.getByTestId('device-policy')).toContainText(
        `"prefersReducedMotion":${reducedMotion === 'reduce'}`
      );
      await expect(header).toHaveAttribute('data-active', 'true');
      await expect(cta).toBeFocused();
      expect(await header.boundingBox()).toEqual(geometry);
      expect(await page.evaluate(() => window.scrollY)).toBe(y);
      expect(await stickyScroll.evaluate((element) => element.scrollLeft)).toBe(
        600
      );
      expect(await scrollport.evaluate((element) => element.scrollLeft)).toBe(
        600
      );
      expect(page.url()).toBe(url);
      await expect(select).toContainText(lang === 'th' ? 'พรีเมียม' : 'Luxury');
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth
      )
    ).toBeLessThanOrEqual(1);
  });
});

it.each(['hardware', 'data saver'])(
  'keeps smooth scroll but disables heavy tab motion for %s limits',
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
    await show();
    await expect(page.getByTestId('device-policy')).toContainText(
      '"allowHeavyMotion":false'
    );
    expect(await switchGroup('Luxury')).toBeLessThan(1);
    await checkScroll(false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.getByTestId('device-policy')).toContainText(
      '"prefersReducedMotion":true'
    );
    await checkScroll(true);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.getByTestId('device-policy')).toContainText(
      '"allowHeavyMotion":false'
    );
    await expect(page.getByTestId('device-policy')).toContainText(
      '"prefersReducedMotion":false'
    );
    await checkScroll(false);
  }
);
