import { cleanup, render, screen, within } from '@testing-library/react';
import {
  createElement,
  type ComponentProps,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PackagesSection from '@features/package-section/components/PackagesSection';
import type { PackagesSectionBlock } from '@features/package-section/types';
import CtaButton from '@shared/components/common/CtaButton';
import { Button } from '@shared/components/ui/button';
import type { Locale, SiteMode } from '@shared/config/preferences';
import type { ContentCta } from '@shared/types';

// Keep the real CTA and Button while isolating SectionShell's media integrations.
vi.mock('@shared/components', () => ({
  CtaButton: (props: ComponentProps<typeof CtaButton>) => (
    <CtaButton {...props} />
  ),
  Button: (props: ComponentProps<typeof Button>) => <Button {...props} />,
  SectionShell: ({
    children,
    background,
    sanityType,
    dataTestId,
    className,
  }: {
    children: ReactNode;
    background?: string;
    sanityType?: string;
    dataTestId?: string;
    className?: string;
  }) => (
    <section
      className={className}
      data-background={background}
      data-sanity-type={sanityType}
      data-testid={dataTestId}
    >
      {children}
    </section>
  ),
}));

vi.mock('next/link', () => ({
  default: (props: ComponentProps<'a'>) => <a {...props} />,
}));

vi.mock('motion/react', () => {
  /** Create a Motion stand-in for the requested HTML tag. */
  const component = (tag: string) =>
    /** Render children and expose animation settings as inspectable attributes. */
    function MotionMock({
      children,
      initial,
      whileInView,
      viewport,
      variants,
      ...props
    }: HTMLAttributes<HTMLElement> & {
      initial?: string;
      whileInView?: string;
      viewport?: unknown;
      variants?: unknown;
    }) {
      return createElement(
        tag,
        {
          ...props,
          'data-initial': initial,
          'data-while-in-view': whileInView,
          'data-viewport': JSON.stringify(viewport),
          'data-variants': JSON.stringify(variants),
        },
        children
      );
    };
  return { m: { div: component('div'), article: component('article') } };
});

afterEach(cleanup);

/** Build localized normal, highlighted, and sparse cards for recap regression tests. */
function packageFixture(lang: Locale): PackagesSectionBlock {
  return {
    _type: 'packagesSection',
    background: 'muted',
    heading: {
      eyebrow: lang === 'th' ? 'แพ็กเกจแนะนำ' : 'Featured packages',
      heading: lang === 'th' ? 'เลือกแพ็กเกจของคุณ' : 'Choose your package',
      body: lang === 'th' ? 'รายละเอียดจาก CMS' : 'CMS introduction',
    },
    packages: [
      {
        _key: 'first',
        title: lang === 'th' ? 'เริ่มต้น' : 'Starter',
        price: 0,
        features: [lang === 'th' ? 'ช่างภาพหนึ่งคน' : 'One photographer'],
        cta: {
          label: lang === 'th' ? 'ติดต่อเรา' : 'Contact us',
          linkType: 'internal',
          pageRef: { slug: 'contact' },
          style: 'secondary',
        },
      },
      {
        _key: 'featured',
        title:
          lang === 'th'
            ? 'แพ็กเกจเก็บทุกความทรงจำในวันสำคัญของคุณ'
            : 'Every memory of your unforgettable celebration',
        price: 5000,
        currency: 'USD',
        featured: true,
        features: ['Ceremony', 'Reception', 'Highlight film'],
        cta: {
          label: lang === 'th' ? 'ดูรายละเอียด' : 'Discover more',
          linkType: 'external',
          externalUrl: 'https://example.com/package',
          style: 'primary',
        },
      },
      { _key: 'sparse', price: 9000, currency: '' },
    ],
  };
}

describe.each<{ mode: SiteMode; lang: Locale }>([
  { mode: 'production', lang: 'en' },
  { mode: 'production', lang: 'th' },
  { mode: 'wedding', lang: 'en' },
  { mode: 'wedding', lang: 'th' },
])('PackagesSection ($mode/$lang)', ({ mode, lang }) => {
  it('preserves localized content, package order, zero prices, and currency fallbacks', () => {
    const block = packageFixture(lang);
    render(<PackagesSection block={block} lang={lang} mode={mode} />);

    const section = screen.getByTestId('packages-section');
    expect(section).toHaveAttribute('data-background', 'muted');
    expect(section).toHaveAttribute('data-sanity-type', 'packagesSection');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      block.heading!.heading!
    );
    expect(screen.getByText(block.heading!.eyebrow!)).toBeInTheDocument();
    expect(screen.getByText(block.heading!.body!)).toBeInTheDocument();

    const cards = screen.getAllByTestId('package-card');
    expect(cards).toHaveLength(3);
    expect(
      within(cards[0]).getByRole('heading', { level: 3 })
    ).toHaveTextContent(block.packages![0].title!);
    expect(within(cards[0]).getByText('0')).toBeInTheDocument();
    expect(within(cards[0]).getByText('THB')).toBeInTheDocument();
    expect(within(cards[1]).getByText('USD')).toBeInTheDocument();
    expect(within(cards[2]).queryByText('THB')).not.toBeInTheDocument();
    expect(within(cards[2]).queryByRole('heading')).not.toBeInTheDocument();
    expect(within(cards[2]).queryByRole('list')).not.toBeInTheDocument();
    expect(within(cards[2]).queryByRole('button')).not.toBeInTheDocument();
    expect(cards[0]).toHaveAttribute('data-featured', 'false');
    expect(cards[1]).toHaveAttribute('data-featured', 'true');
  });

  it('groups names and prices in a natural-height header within three subgrid rows', () => {
    render(
      <PackagesSection block={packageFixture(lang)} lang={lang} mode={mode} />
    );
    const cards = screen.getAllByTestId('package-card');
    expect(cards[0].parentElement).toHaveClass('grid', 'md:grid-cols-3');
    for (const card of cards) {
      expect(card).toHaveClass('row-span-3', 'grid', 'grid-rows-subgrid');
      expect(card).toHaveClass('min-w-0', 'grid-cols-1', 'rounded-3xl');
      expect(card).not.toHaveClass('h-full', 'flex');
      const header = card.firstElementChild;
      expect(header?.tagName).toBe('HEADER');
      expect(header).toHaveClass(
        'row-start-1',
        'flex',
        'flex-col',
        'gap-6',
        'self-start'
      );
      expect(header).not.toHaveClass(
        'grid-rows-subgrid',
        'justify-between',
        'justify-end'
      );
      expect(card.children[card.children.length - 1]).toHaveClass(
        'row-start-3',
        'grid',
        '[&>a]:grid'
      );
    }
    const title = within(cards[1]).getByRole('heading', { level: 3 });
    expect(title).toHaveClass('text-center', 'text-4xl', 'wrap-anywhere');
    const price = within(cards[1]).getByText('5000');
    const currency = within(cards[1]).getByText('USD');
    expect(price).toHaveClass('text-5xl');
    expect(currency).toHaveClass('text-base');
    expect(price.parentElement).toBe(currency.parentElement);
    expect(price.nextElementSibling).toBe(currency);
    expect(price.parentElement?.parentElement).toBe(title.parentElement);
    expect(title.parentElement).toBe(cards[1].firstElementChild);
    expect(title).not.toHaveClass('row-start-1');
    expect(price.parentElement).not.toHaveClass('row-start-2');
    expect(price.parentElement).toHaveClass(
      'flex',
      'items-baseline',
      'justify-center'
    );
    const details = within(cards[1]).getByRole('list');
    expect(details).toHaveClass('row-start-2');
    expect(details).not.toHaveClass('list-disc', 'text-center');
    expect(within(details).getAllByRole('listitem')).toHaveLength(3);
    expect(within(cards[0]).getAllByRole('listitem')).toHaveLength(1);
    expect(
      within(cards[2]).getByText('9000').parentElement?.parentElement
    ).toBe(cards[2].firstElementChild);
  });

  it('scopes Production highlight text tokens without changing other card colors', () => {
    render(
      <PackagesSection block={packageFixture(lang)} lang={lang} mode={mode} />
    );
    const [normal, featured, sparse] = screen.getAllByTestId('package-card');
    for (const card of [normal, sparse]) {
      expect(card).toHaveClass('bg-neutral', 'text-neutral-foreground');
      expect(card).not.toHaveClass('bg-primary', 'bg-background', 'text-white');
    }
    expect(featured).toHaveClass('bg-primary', 'text-primary-foreground');
    expect(featured).not.toHaveClass('bg-neutral', 'text-white');
    for (const card of [normal, featured, sparse]) {
      expect(card.style.backgroundColor).toBe('');
    }
    const title = within(featured).getByRole('heading', { level: 3 });
    const price = within(featured).getByText('5000');
    const currency = within(featured).getByText('USD');
    const details = within(featured).getByRole('list');
    if (mode === 'production') {
      for (const element of [title, price, currency]) {
        expect(element).toHaveClass('text-text-primary');
      }
      expect(currency).not.toHaveClass('text-primary-foreground/80');
      expect(details).toHaveClass('text-text-primary');
      expect(details).not.toHaveClass('text-text-secondary');
    } else {
      for (const element of [title, price, currency]) {
        expect(element).not.toHaveClass('text-text-primary');
      }
      expect(currency).toHaveClass('text-primary-foreground/80');
      expect(details).toHaveClass('text-primary-foreground');
      expect(details).not.toHaveClass('text-text-secondary');
    }
    expect(within(normal).getByRole('heading', { level: 3 })).not.toHaveClass(
      'text-text-primary'
    );
    expect(within(normal).getByText('0')).not.toHaveClass('text-text-primary');
    expect(within(normal).getByText('THB')).toHaveClass(
      'text-neutral-foreground-secondary'
    );
    expect(within(normal).getByRole('list')).toHaveClass(
      'text-neutral-foreground-secondary'
    );
  });

  it('reuses CTA variants without changing CMS data or navigation', () => {
    const block = packageFixture(lang);
    const original = structuredClone(block);
    Object.freeze(block.packages![1].cta);
    Object.freeze(block.packages![1]);
    Object.freeze(block.packages![0].cta);
    Object.freeze(block.packages![0]);
    render(<PackagesSection block={block} lang={lang} mode={mode} />);

    const cards = screen.getAllByTestId('package-card');
    const normal = within(cards[0]).getByRole('button');
    expect(normal).toHaveAttribute('data-variant', 'secondary');
    expect(normal).toHaveClass('bg-transparent', 'hover:bg-white/10');
    expect(normal.closest('a')).toHaveAttribute(
      'href',
      `/${lang}/${mode}/contact`
    );
    expect(normal.closest('a')).not.toHaveAttribute('target');

    const featured = within(cards[1]).getByRole('button');
    expect(featured).toHaveAttribute('data-variant', 'neutral');
    expect(featured).toHaveClass(
      'bg-neutral',
      'text-neutral-foreground',
      'w-full'
    );
    expect(featured).not.toHaveClass(
      'bg-transparent',
      'text-current',
      'hover:bg-white/10'
    );
    expect(featured).toHaveClass('focus-visible:ring-[3px]');
    expect(featured).not.toHaveClass(
      'text-text-primary',
      'text-text-secondary',
      'hover:not-disabled:text-neutral'
    );
    if (mode === 'wedding') {
      expect(featured).toHaveClass('hover:not-disabled:bg-black');
      expect(featured).not.toHaveClass('hover:not-disabled:bg-primary');
    } else {
      expect(featured).toHaveClass(
        'hover:not-disabled:bg-primary',
        'dark:hover:not-disabled:bg-background',
        'dark:hover:not-disabled:text-text-primary'
      );
      expect(featured).not.toHaveClass('hover:not-disabled:bg-black');
    }
    expect(featured.closest('a')).toHaveAttribute(
      'href',
      'https://example.com/package'
    );
    expect(featured.closest('a')).toHaveAttribute('target', '_blank');
    expect(featured.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    expect(featured).toHaveTextContent(block.packages![1].cta!.label!);
    expect(block).toEqual(original);
  });
  it.each<ContentCta['style']>([
    'primary',
    'secondary',
    'neutral',
    'link',
    null,
  ])(
    'determines both CTA variants from highlight when CMS style is %s',
    (style) => {
      const block = packageFixture(lang);
      block.packages![0].cta!.style = style;
      block.packages![1].cta!.style = style;
      const original = structuredClone(block);
      render(<PackagesSection block={block} lang={lang} mode={mode} />);
      const [normal, featured] = screen.getAllByRole('button');
      expect(normal).toHaveAttribute('data-variant', 'secondary');
      expect(featured).toHaveAttribute('data-variant', 'neutral');
      expect(block).toEqual(original);
    }
  );
});

describe('PackagesSection regressions', () => {
  it.each([undefined, []])(
    'renders no cards when packages are %s',
    (packages) => {
      render(
        <PackagesSection
          block={{ _type: 'packagesSection', packages }}
          lang='en'
          mode='wedding'
        />
      );
      expect(screen.queryByTestId('package-card')).not.toBeInTheDocument();
      expect(screen.getByTestId('packages-section')).toHaveClass(
        'bg-background'
      );
    }
  );

  it('keeps the existing viewport, stagger, and card animation settings', () => {
    const block = packageFixture('en');
    block.packages = [block.packages![0]];
    render(<PackagesSection block={block} lang='en' mode='wedding' />);
    const card = screen.getByTestId('package-card');
    const grid = card.parentElement!;
    expect(grid).toHaveAttribute('data-initial', 'hidden');
    expect(grid).toHaveAttribute('data-while-in-view', 'visible');
    expect(JSON.parse(grid.dataset.viewport!)).toEqual({
      once: true,
      margin: '-100px',
    });
    expect(JSON.parse(grid.dataset.variants!)).toEqual({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
      },
    });
    expect(JSON.parse(card.dataset.variants!)).toEqual({
      hidden: { opacity: 0, y: 18 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    });
    expect(card.style.backgroundColor).toBe('');
  });
});
