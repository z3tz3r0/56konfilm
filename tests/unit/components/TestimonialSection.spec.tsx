import { createElement, type ComponentProps, type HTMLAttributes } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TestimonialSection from '@features/testimonial-section/components/TestimonialSection';
import type { TestimonialSectionBlock } from '@features/testimonial-section/types';
import AppIcon from '@shared/components/common/AppIcon';
import SectionHeader from '@shared/components/common/section-header';
import SectionShell from '@shared/components/common/SectionShell';
import FixtureImage from '../../support/browser/logo-showcase/fixtureImage';
import { fadeUpItemVariants } from '@shared/lib/motion';

// Keep real Carousel provider/consumers; replace only its geometry-dependent engine.
const engine = vi.hoisted(() => {
  let selected = 0;
  const listeners = new Map<string, Set<(api: unknown) => void>>();
  const select = (index: number) => {
    selected = index;
    listeners.get('select')?.forEach((callback) => callback(api));
  };
  const api = {
    selectedScrollSnap: vi.fn(() => selected),
    canScrollPrev: vi.fn(() => true),
    canScrollNext: vi.fn(() => true),
    scrollPrev: vi.fn(() => select((selected + 2) % 3)),
    scrollNext: vi.fn(() => select((selected + 1) % 3)),
    scrollTo: vi.fn((index: number) => select(index)),
    on: vi.fn((event: string, callback: (api: unknown) => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(callback);
      return api;
    }),
    off: vi.fn((event: string, callback: (api: unknown) => void) => {
      listeners.get(event)?.delete(callback);
      return api;
    }),
  };
  const ref = vi.fn();
  return {
    api,
    listeners,
    select,
    reset: () => {
      selected = 0;
    },
    useEmbla: vi.fn(() => [ref, api]),
  };
});
const media = vi.hoisted(() => ({
  getImageUrl: vi.fn(
    () =>
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  ),
  thumbnail: { width: 48 },
}));

vi.mock('embla-carousel-react', () => ({ default: engine.useEmbla }));
vi.mock('@shared/components', async () => ({
  ...(await import('@shared/components/ui/carousel')),
  AppIcon: (props: ComponentProps<typeof AppIcon>) => <AppIcon {...props} />,
  SectionHeader: (props: ComponentProps<typeof SectionHeader>) => (
    <SectionHeader {...props} />
  ),
  SectionShell: (props: ComponentProps<typeof SectionShell>) => (
    <SectionShell {...props} />
  ),
  VideoLoop: () => null,
}));
vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className }: { icon: string; className?: string }) => (
    <svg role='img' data-icon-name={icon} className={className} />
  ),
}));
vi.mock('@/sanity/lib/image', () => ({
  getImageUrl: media.getImageUrl,
  THUMBNAIL_IMAGE: media.thumbnail,
  urlFor: () => {
    throw new Error('Unexpected section background media request');
  },
}));
vi.mock('next/image', () => ({
  default: (props: ComponentProps<typeof FixtureImage>) => (
    <FixtureImage {...props} />
  ),
}));
vi.mock('motion/react', () => ({
  m: {
    article: ({
      initial,
      whileInView,
      viewport,
      variants,
      ...props
    }: HTMLAttributes<HTMLElement> & {
      initial?: unknown;
      whileInView?: unknown;
      viewport?: unknown;
      variants?: unknown;
    }) =>
      createElement('article', {
        ...props,
        'data-initial': JSON.stringify(initial),
        'data-in-view': JSON.stringify(whileInView),
        'data-viewport': JSON.stringify(viewport),
        'data-variants': JSON.stringify(variants),
      }),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  engine.reset();
  engine.listeners.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(new Error('Unexpected network request'))
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-mode');
  document.documentElement.removeAttribute('lang');
});

function fixture(lang: 'en' | 'th' = 'en', count = 3): TestimonialSectionBlock {
  return {
    _type: 'testimonialSection',
    heading: {
      heading: lang === 'th' ? 'เสียงจากลูกค้า' : 'What our clients say',
    },
    testimonials: Array.from({ length: count }, (_, index) => ({
      _key: `review-${index}`,
      quote:
        lang === 'th'
          ? `ผลงานที่ประทับใจ ${index + 1}`
          : `A memorable experience ${index + 1}`,
      authorName:
        lang === 'th' ? `ผู้รีวิว ${index + 1}` : `Reviewer ${index + 1}`,
      authorTitle: lang === 'th' ? `บทบาท ${index + 1}` : `Role ${index + 1}`,
      authorImage: { asset: { _ref: `image-fixture-${index}-48x48-png` } },
    })),
  };
}

describe('Testimonial card styling and icons', () => {
  for (const mode of ['production', 'wedding'] as const) {
    it.each(['en', 'th'] as const)(
      `preserves content and uses neutral card tokens for ${mode}/%s`,
      (lang) => {
        document.documentElement.dataset.mode = mode;
        document.documentElement.lang = lang;
        const block = fixture(lang);
        const before = structuredClone(block);
        render(<TestimonialSection block={block} />);
        const cards = screen.getAllByRole('article');
        expect(cards).toHaveLength(3);
        cards.forEach((card, index) => {
          const item = block.testimonials![index];
          expect(card).toHaveClass('bg-neutral', 'text-neutral-foreground');
          expect(card).not.toHaveClass('bg-secondary/80');
          expect(within(card).getByText(item.quote!)).not.toHaveClass(
            'text-foreground'
          );
          expect(within(card).getByText(item.quote!)).toHaveClass(
            'text-lg',
            'leading-relaxed'
          );
          expect(within(card).getByText(item.authorName!)).toHaveClass(
            'text-base',
            'font-semibold'
          );
          expect(within(card).getByText(item.authorTitle!)).toHaveClass(
            'text-neutral-foreground-secondary'
          );
          const icon = card.querySelector('[data-slot="app-icon"]')!;
          expect(icon).toHaveAttribute('data-variant', 'plain');
          expect(icon).toHaveClass('size-12', 'text-primary');
          expect(icon).not.toHaveClass('bg-primary', 'rounded-full');
          expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
          expect(
            card.querySelectorAll('svg[data-icon-name="bi:quote"]')
          ).toHaveLength(1);
          expect(card.textContent).not.toContain('“');
          expect(within(card).getAllByRole('img')).toHaveLength(1); // Avatar only; quote is decorative.
          expect(within(card).getByRole('img')).toHaveAttribute(
            'alt',
            item.authorName
          );
          expect(card).toHaveAttribute(
            'data-initial',
            JSON.stringify('hidden')
          );
          expect(card).toHaveAttribute(
            'data-in-view',
            JSON.stringify('visible')
          );
          expect(card).toHaveAttribute(
            'data-viewport',
            JSON.stringify({ once: true, margin: '-100px' })
          );
          expect(card).toHaveAttribute(
            'data-variants',
            JSON.stringify(fadeUpItemVariants)
          );
        });
        expect(screen.getByRole('heading')).toHaveTextContent(
          block.heading!.heading
        );
        expect(screen.getByTestId('testimonial-item')).toBe(cards[0]);
        cards
          .slice(1)
          .forEach((card) =>
            expect(card).toHaveClass('pointer-events-none', 'opacity-0')
          );
        expect(media.getImageUrl).toHaveBeenCalledWith(
          block.testimonials![0].authorImage,
          media.thumbnail
        );
        expect(block).toEqual(before);
      }
    );
  }

  it.each([undefined, []])(
    'renders a heading but no carousel for missing/empty items (%j)',
    (testimonials) => {
      render(<TestimonialSection block={{ ...fixture(), testimonials }} />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.queryByRole('region')).not.toBeInTheDocument();
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText(/Go to testimonial/)
      ).not.toBeInTheDocument();
    }
  );
  it('renders one card without pagination dots', () => {
    render(<TestimonialSection block={fixture('en', 1)} />);
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(
      screen.queryByLabelText(/Go to testimonial/)
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('carousel-next')).toBeInTheDocument();
  });
  it('supports optional content, missing keys, and the existing avatar alt fallback', () => {
    render(
      <TestimonialSection
        block={{
          _type: 'testimonialSection',
          testimonials: [
            {},
            { authorImage: { asset: { _ref: 'image-fixture-48x48-png' } } },
          ],
        }}
      />
    );
    const cards = screen.getAllByRole('article');
    expect(cards[0].querySelector('p')).toBeNull();
    expect(within(cards[0]).queryByRole('img')).not.toBeInTheDocument();
    expect(within(cards[1]).getByRole('img')).toHaveAttribute('alt', 'Author');
    cards.forEach((card) =>
      expect(card.querySelectorAll('[data-slot="app-icon"]')).toHaveLength(1)
    );
  });
  it.each([undefined, 'default', 'muted', 'contrast'])(
    'preserves the section background (%s)',
    (background) => {
      render(<TestimonialSection block={{ ...fixture(), background }} />);
      const section = screen.getByTestId('testimonial-section');
      expect(section).toHaveAttribute('data-sanity-type', 'testimonialSection');
      if (!background || background === 'default')
        expect(section).toHaveClass('bg-background');
      if (background === 'muted') expect(section).toHaveClass('bg-secondary');
      if (background === 'contrast') expect(section).toHaveClass('bg-primary');
      screen
        .getAllByRole('article')
        .forEach((card) => expect(card).toHaveClass('bg-neutral'));
    }
  );
});

describe('Testimonial carousel regression', () => {
  it('preserves engine options, previous/next, pagination and selected card state', () => {
    render(<TestimonialSection block={fixture()} />);
    expect(engine.useEmbla).toHaveBeenCalledWith(
      { align: 'start', loop: true, axis: 'x' },
      undefined
    );
    fireEvent.click(screen.getByTestId('carousel-next'));
    expect(engine.api.scrollNext).toHaveBeenCalledOnce();
    expect(screen.getByTestId('testimonial-item')).toHaveTextContent(
      'Reviewer 2'
    );
    fireEvent.click(screen.getByTestId('carousel-prev'));
    expect(engine.api.scrollPrev).toHaveBeenCalledOnce();
    expect(screen.getByTestId('testimonial-item')).toHaveTextContent(
      'Reviewer 1'
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Go to testimonial 3' })
    );
    expect(engine.api.scrollTo).toHaveBeenCalledWith(2);
    expect(screen.getByTestId('testimonial-item')).toHaveTextContent(
      'Reviewer 3'
    );
    expect(
      screen.getByRole('button', { name: 'Go to testimonial 3' })
    ).toHaveClass('bg-[var(--color-brown)]');
    for (const id of ['carousel-prev', 'carousel-next']) {
      const button = screen.getByTestId(id);
      expect(button).toHaveAttribute('data-variant', 'secondary');
      expect(button).toHaveClass(
        'text-primary',
        'border-primary',
        'hover:not-disabled:bg-primary',
        'hover:not-disabled:text-primary-foreground',
        'focus-visible:border-ring',
        'focus-visible:ring-ring/50'
      );
      for (const override of [
        'bg-[var(--color-brown)]',
        'text-[var(--color-ivory-white)]',
        'hover:bg-[var(--color-mocha-brown)]',
        'dark:bg-transparent',
        'dark:border-neutral',
        'dark:hover:not-disabled:bg-neutral',
        'dark:hover:not-disabled:text-neutral-foreground',
        'dark:focus-visible:border-primary',
        'dark:focus-visible:ring-primary',
      ])
        expect(button).not.toHaveClass(override);
    }
  });
  it('updates on reInit and removes its select/reInit subscriptions on unmount', () => {
    const { unmount } = render(<TestimonialSection block={fixture()} />);
    act(() => {
      engine.select(1);
      engine.listeners
        .get('reInit')
        ?.forEach((callback) => callback(engine.api));
    });
    expect(screen.getByTestId('testimonial-item')).toHaveTextContent(
      'Reviewer 2'
    );
    unmount();
    // Inspect this section's paired cleanup, independently of shared Carousel subscriptions.
    const reInitCleanup = engine.api.off.mock.calls.find(
      ([event]) => event === 'reInit'
    );
    expect(reInitCleanup).toBeDefined();
    const handler = reInitCleanup![1];
    expect(engine.api.on).toHaveBeenCalledWith('reInit', handler);
    expect(engine.api.on).toHaveBeenCalledWith('select', handler);
    expect(engine.api.off).toHaveBeenCalledWith('select', handler);
    expect(engine.listeners.get('select')?.has(handler)).toBe(false);
    expect(engine.listeners.get('reInit')?.has(handler)).toBe(false);
  });
});
