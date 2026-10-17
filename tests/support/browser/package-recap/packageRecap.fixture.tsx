import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement, type ComponentProps, type HTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  chromium,
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
  expect,
  it,
  vi,
} from 'vitest';
import PackagesSection from '@features/package-section/components/PackagesSection';
import type { PackagesSectionBlock } from '@features/package-section/types';
import CtaButton from '@shared/components/common/CtaButton';
import SectionShell from '@shared/components/common/SectionShell';
import { Button } from '@shared/components/ui/button';
import type { Locale, SiteMode } from '@shared/config/preferences';
import { compileFixtureCss } from './fixtureCss';
import {
  assertCentered,
  assertDesktopRows,
  assertMobileStack,
  assertNaturalPriceSpacing,
  measureCards,
} from './layoutAssertions';

// Keep layout/CTA implementations real without importing unrelated barrel integrations.
vi.mock('@shared/components', () => ({
  CtaButton: (props: ComponentProps<typeof CtaButton>) => (
    <CtaButton {...props} />
  ),
  SectionShell: (props: ComponentProps<typeof SectionShell>) => (
    <SectionShell {...props} />
  ),
  Button: (props: ComponentProps<typeof Button>) => <Button {...props} />,
  VideoLoop: () => null,
}));
vi.mock('@shared/config', () => ({}));
vi.mock('@/sanity/lib/image', () => ({
  urlFor: () => {
    throw new Error('This layout fixture must not request Sanity media.');
  },
}));
vi.mock('next/image', () => ({
  default: () => {
    throw new Error('This layout fixture must not load images.');
  },
}));
vi.mock('next/link', () => ({
  default: (props: ComponentProps<'a'>) => <a {...props} />,
}));
vi.mock('motion/react', () => {
  /** Create a static Motion stand-in for the requested HTML tag. */
  const element = (tag: string) =>
    /** Render the element without Motion props so geometry checks see its final layout. */
    function StaticMotion({
      initial: _initial,
      whileInView: _whileInView,
      viewport: _viewport,
      variants: _variants,
      ...props
    }: HTMLAttributes<HTMLElement> & {
      initial?: unknown;
      whileInView?: unknown;
      viewport?: unknown;
      variants?: unknown;
    }) {
      return createElement(tag, props);
    };
  return { m: { div: element('div'), article: element('article') } };
});

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const contexts: Array<{ mode: SiteMode; lang: Locale }> = [
  { mode: 'production', lang: 'en' },
  { mode: 'production', lang: 'th' },
  { mode: 'wedding', lang: 'en' },
  { mode: 'wedding', lang: 'th' },
];
let browser: Browser;
let context: BrowserContext;
let page: Page;
let css: string;
let requests: string[];

beforeAll(async () => {
  css = await compileFixtureCss(root);
  try {
    browser = await chromium.launch({
      headless: true,
      channel: process.env.PACKAGE_RECAP_BROWSER_CHANNEL || undefined,
    });
  } catch (cause) {
    throw new Error(
      'Install Chromium with pnpm exec playwright install chromium, or run this fixture with --channel=chrome for an installed Chrome.',
      { cause }
    );
  }
});
beforeEach(async () => {
  requests = [];
  context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route('**/*', (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  page = await context.newPage();
});
afterEach(async ({ task }) => {
  try {
    if (task.result?.state === 'fail' && page && !page.isClosed()) {
      const output = resolve(root, 'play-results/package-recap-layout');
      await mkdir(output, { recursive: true });
      await page.screenshot({
        path: resolve(output, task.id + '.png'),
        fullPage: true,
      });
    }
  } finally {
    await context?.close();
  }
});
afterAll(async () => {
  await browser?.close();
});

/** Build localized cards with varied title lengths, detail counts, prices, and CTAs. */
function packages(lang: Locale): PackagesSectionBlock {
  const cta = {
    label: lang === 'th' ? 'ดูรายละเอียด' : 'Discover more',
    style: 'secondary' as const,
    linkType: 'internal' as const,
    pageRef: { slug: 'contact' },
  };
  return {
    _type: 'packagesSection',
    background: 'muted',
    heading: {
      heading: lang === 'th' ? 'แพ็กเกจแนะนำ' : 'Choose your package',
    },
    packages: [
      {
        _key: 'short',
        title: lang === 'th' ? 'เริ่มต้น' : 'Starter',
        price: 0,
        currency: 'THB',
        features: ['Ceremony'],
        cta,
      },
      {
        _key: 'long',
        title:
          lang === 'th'
            ? 'แพ็กเกจเก็บทุกความทรงจำในวันสำคัญของคุณ'
            : 'Every memory of your unforgettable celebration',
        price: 5000,
        currency: 'USD',
        featured: true,
        features: ['Ceremony', 'Reception', 'Highlight film', 'Full film'],
        cta,
      },
      {
        _key: 'medium',
        title: lang === 'th' ? 'ครบทุกช่วงเวลา' : 'Grand Symphony',
        price: 9000,
        currency: 'THB',
        features: ['Ceremony', 'Reception'],
        cta: {
          ...cta,
          label:
            lang === 'th'
              ? 'ดูรายละเอียดเพิ่มเติมเกี่ยวกับแพ็กเกจของเรา'
              : 'Discover every detail of this package',
        },
      },
    ],
  };
}

/** Render real recap markup and CSS at the requested viewport, optionally with sparse cards. */
async function renderFixture(
  mode: SiteMode,
  lang: Locale,
  width: number,
  sparse = false
) {
  const block = packages(lang);
  if (sparse) {
    block.packages = [
      { _key: 'missing-title-details-cta', price: 0 },
      block.packages![1],
      { _key: 'missing-details-cta', title: 'Title only', price: 1000 },
      { ...block.packages![0], _key: 'next-row' },
    ];
  }
  const markup = renderToStaticMarkup(
    <PackagesSection block={block} lang={lang} mode={mode} />
  );
  await page.setViewportSize({ width, height: 1000 });
  // Deterministic local fallback fonts only; no Google font downloads or layout overrides.
  const fonts =
    ':root { --font-cormorant-garamond: Arial, sans-serif; --font-ibm-plex-sans-thai: Arial, sans-serif; --font-manrope: Arial, sans-serif; --font-anuphan: Arial, sans-serif; }';
  await page.setContent(
    '<!doctype html><html lang="' +
      lang +
      '" data-mode="' +
      mode +
      '"><head><style>' +
      css +
      fonts +
      '</style></head><body>' +
      markup +
      '</body></html>'
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((done) =>
      requestAnimationFrame(() => requestAnimationFrame(() => done()))
    );
  });
}

/** Assert that the fixture fits the viewport and has requested no network resources. */
async function assertNoPageOverflow() {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth
    ),
    'page does not overflow horizontally'
  ).toBeLessThanOrEqual(1);
  expect(requests, 'fixture never requests network resources').toEqual([]);
}

describe.each(contexts)(
  'Package Recap geometry ($mode/$lang)',
  ({ mode, lang }) => {
    it.each([320, 375, 767, 768, 1024, 1280])(
      'renders centered, aligned content at %ipx',
      async (width) => {
        await renderFixture(mode, lang, width);
        const cards = await measureCards(page);
        expect(cards).toHaveLength(3);
        assertCentered(cards);
        assertNaturalPriceSpacing(cards);
        if (width >= 768) {
          assertDesktopRows(cards);
          expect(
            cards[1].title!.height,
            'fixture exercises a taller multiline name'
          ).toBeGreaterThan(cards[0].title!.height);
          expect(
            cards[1].price.top,
            'prices are not forced onto a shared baseline'
          ).toBeGreaterThan(cards[0].price.top);
        } else {
          assertMobileStack(cards);
        }
        await assertNoPageOverflow();
      }
    );

    it.each([320, 768])(
      'preserves missing-content slots and subsequent rows at %ipx',
      async (width) => {
        await renderFixture(mode, lang, width, true);
        const cards = await measureCards(page);
        expect(cards).toHaveLength(4);
        expect(cards[0].title).toBeNull();
        expect(cards[0].details).toBeNull();
        expect(cards[0].button).toBeNull();
        assertCentered(cards);
        assertNaturalPriceSpacing(cards);
        if (width >= 768) {
          assertDesktopRows(cards.slice(0, 3));
          expect(cards[3].card.top).toBeGreaterThan(cards[0].card.bottom);
        } else {
          assertMobileStack(cards);
        }
        await assertNoPageOverflow();
      }
    );
  }
);

describe('Geometry assertion negative controls (fixture DOM only)', () => {
  it('detects left-aligned title text even when the heading wrapper stays full width', async () => {
    await renderFixture('wedding', 'en', 1280);
    assertCentered(await measureCards(page));
    await page
      .getByTestId('package-card')
      .first()
      .locator('h3')
      .evaluate((element) => {
        element.style.textAlign = 'left';
      });
    const cards = await measureCards(page);
    expect(() => assertCentered(cards)).toThrow(/title text is centered/);
  });

  it('detects left-aligned prices even when their full-width wrapper is unchanged', async () => {
    await renderFixture('production', 'en', 1280);
    assertCentered(await measureCards(page));
    await page
      .getByTestId('package-card')
      .first()
      .locator('header > div')
      .evaluate((element) => {
        element.style.justifyContent = 'flex-start';
      });
    const cards = await measureCards(page);
    expect(() => assertCentered(cards)).toThrow(
      /price\/currency text is centered/
    );
  });

  it('detects independent rows after disabling subgrid without changing the source component', async () => {
    await renderFixture('wedding', 'en', 1280);
    assertDesktopRows(await measureCards(page));
    await page.getByTestId('package-card').evaluateAll((cards) => {
      for (const card of cards)
        (card as HTMLElement).style.gridTemplateRows = 'auto auto auto';
    });
    const cards = await measureCards(page);
    expect(() => assertDesktopRows(cards)).toThrow(
      /row tops align|button bottoms align/
    );
  });
});
