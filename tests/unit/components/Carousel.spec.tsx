import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  ScrollableCarousel,
} from '@shared/components';
import type { Locale, SiteMode } from '@shared/config/preferences';
import PortfolioFilter from '@/app/[lang]/[mode]/[firstSegment]/_components/PortfolioFilter';

// Only the Embla engine is replaced; the public barrel and React context are real.
const engine = vi.hoisted(() => {
  const listeners = new Map<string, Set<(api: unknown) => void>>();
  const api = {
    scrollNext: vi.fn(),
    scrollPrev: vi.fn(),
    canScrollNext: vi.fn(() => true),
    canScrollPrev: vi.fn(() => false),
    rootNode: vi.fn<() => HTMLElement>(),
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
  const ref = vi.fn((node: HTMLElement | null) => {
    if (node) api.rootNode.mockReturnValue(node);
  });
  return { api, listeners, useEmbla: vi.fn(() => [ref, api]) };
});
const navigation = vi.hoisted(() => ({
  pathname: '',
  query: '',
  push: vi.fn(),
}));

vi.mock('embla-carousel-react', () => ({ default: engine.useEmbla }));
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => new URLSearchParams(navigation.query),
}));
vi.mock('@shared/config', async () => ({
  ...(await import('@shared/config/preferences')),
  env: {},
}));

beforeEach(() => {
  vi.clearAllMocks();
  engine.listeners.clear();
  engine.api.rootNode.mockReset();
  engine.api.canScrollPrev.mockReturnValue(false);
  engine.api.canScrollNext.mockReturnValue(true);
  navigation.pathname = '/en/production/portfolio';
  navigation.query = '';
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(new Error('Unexpected network request'))
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function tags(lang: Locale) {
  return [
    {
      _id: 'corporate',
      slug: 'corporate-video',
      title: lang === 'en' ? 'Corporate Video' : 'วิดีโอองค์กร',
    },
    {
      _id: 'film',
      slug: 'film',
      title: lang === 'en' ? 'Film' : 'ภาพยนตร์',
    },
  ];
}

function renderFilter(mode: SiteMode, lang: Locale, query = '') {
  navigation.pathname = `/${lang}/${mode}/portfolio`;
  navigation.query = query;
  return render(<PortfolioFilter mode={mode} lang={lang} tags={tags(lang)} />);
}

describe.each(['production', 'wedding'] as const)(
  'PortfolioFilter real Carousel integration in %s',
  (mode) => {
    describe.each(['en', 'th'] as const)('%s', (lang) => {
      const all = lang === 'en' ? 'All Projects' : 'โปรเจกต์ทั้งหมด';

      it('renders the All button through the provider when there are no tags', () => {
        navigation.pathname = `/${lang}/${mode}/portfolio`;
        render(<PortfolioFilter mode={mode} lang={lang} tags={[]} />);
        expect(screen.getByRole('region')).toHaveAttribute(
          'data-slot',
          'carousel'
        );
        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(screen.getByRole('button', { name: all })).toHaveAttribute(
          'data-variant',
          'default'
        );
        expect(screen.getAllByRole('group')).toHaveLength(1);
      });

      it('renders several tags and updates the active button on navigation', () => {
        const { rerender } = renderFilter(mode, lang);
        expect(screen.getAllByRole('group')).toHaveLength(3);
        expect(screen.getByRole('button', { name: all })).toHaveAttribute(
          'data-variant',
          'default'
        );
        const corporate = screen.getByRole('button', {
          name: tags(lang)[0].title,
        });
        expect(corporate).toHaveAttribute(
          'data-variant',
          mode === 'production' ? 'neutral' : 'secondary'
        );

        navigation.query = 'tag=corporate-video';
        rerender(<PortfolioFilter mode={mode} lang={lang} tags={tags(lang)} />);
        expect(corporate).toHaveAttribute('data-variant', 'default');
        expect(screen.getByRole('button', { name: all })).toHaveAttribute(
          'data-variant',
          mode === 'production' ? 'neutral' : 'secondary'
        );
        expect(
          screen.getByRole('button', { name: tags(lang)[1].title })
        ).toBeVisible();
      });

      it('selects a tag, preserves unrelated queries, and resets pagination without scrolling', () => {
        renderFilter(mode, lang, 'tag=film&page=3&limit=15&campaign=summer');
        fireEvent.click(
          screen.getByRole('button', { name: tags(lang)[0].title })
        );
        expect(navigation.push).toHaveBeenCalledExactlyOnceWith(
          `/${lang}/${mode}/portfolio?tag=corporate-video&limit=15&campaign=summer`,
          { scroll: false }
        );
      });

      it('clears the tag and page when All Projects is selected', () => {
        renderFilter(
          mode,
          lang,
          'tag=corporate-video&page=4&limit=6&campaign=summer'
        );
        fireEvent.click(screen.getByRole('button', { name: all }));
        expect(navigation.push).toHaveBeenCalledExactlyOnceWith(
          `/${lang}/${mode}/portfolio?limit=6&campaign=summer`,
          { scroll: false }
        );
      });
    });
  }
);

function Slides() {
  return (
    <CarouselContent>
      <CarouselItem>First project</CarouselItem>
      <CarouselItem>Second project</CarouselItem>
    </CarouselContent>
  );
}

describe('Shared Carousel context and controls', () => {
  it.each([
    ['content', CarouselContent],
    ['item', CarouselItem],
    ['previous button', CarouselPrevious],
    ['next button', CarouselNext],
  ] as const)('keeps the missing-provider guard for %s', (_name, Consumer) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(
      'useCarousel must be used within a <Carousel />'
    );
  });

  it('shares context with real arrow buttons, responds to selection, and supports the keyboard', () => {
    const { unmount } = render(
      <Carousel>
        <Slides />
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
    const previous = screen.getByRole('button', { name: 'Previous slide' });
    const next = screen.getByRole('button', { name: 'Next slide' });
    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();
    expect(next).toHaveAttribute('data-slot', 'carousel-next');
    fireEvent.click(next);
    expect(engine.api.scrollNext).toHaveBeenCalledOnce();

    act(() => {
      engine.api.canScrollPrev.mockReturnValue(true);
      engine.api.canScrollNext.mockReturnValue(false);
      engine.listeners
        .get('select')
        ?.forEach((callback) => callback(engine.api));
    });
    expect(previous).toBeEnabled();
    expect(next).toBeDisabled();
    fireEvent.click(previous);
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowLeft' });
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
    expect(engine.api.scrollPrev).toHaveBeenCalledTimes(2);
    expect(engine.api.scrollNext).toHaveBeenCalledTimes(2);

    unmount();
    expect(engine.listeners.get('select')?.size).toBe(0);
  });
});

describe('ScrollableCarousel wrapper', () => {
  it('forwards its API and options and retains wheel gestures alongside custom plugins', () => {
    const setApi = vi.fn();
    const customPlugin = {
      name: 'fixture-plugin',
      options: { active: true, breakpoints: {} },
      init: vi.fn(),
      destroy: vi.fn(),
    };
    render(
      <ScrollableCarousel
        opts={{ align: 'start', dragFree: true }}
        plugins={[customPlugin]}
        setApi={setApi}
      >
        <Slides />
      </ScrollableCarousel>
    );
    expect(setApi).toHaveBeenCalledExactlyOnceWith(engine.api);
    expect(engine.useEmbla).toHaveBeenLastCalledWith(
      { align: 'start', dragFree: true, axis: 'x' },
      [expect.objectContaining({ name: 'wheelGestures' }), customPlugin]
    );
    expect(screen.getByText('First project')).toBeVisible();
  });

  it('handles Shift+wheel in both directions, leaves ordinary wheel events native, and removes its listener', () => {
    const { unmount } = render(
      <ScrollableCarousel>
        <Slides />
      </ScrollableCarousel>
    );
    const viewport = engine.api.rootNode();
    const removeListener = vi.spyOn(viewport, 'removeEventListener');
    for (const delta of [
      { deltaY: 40 },
      { deltaX: 40 },
      { deltaY: -40 },
      { deltaX: -40 },
    ]) {
      const event = new WheelEvent('wheel', {
        ...delta,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      fireEvent(viewport, event);
      expect(event.defaultPrevented).toBe(true);
    }
    expect(engine.api.scrollNext).toHaveBeenCalledTimes(2);
    expect(engine.api.scrollPrev).toHaveBeenCalledTimes(2);

    const ordinaryWheel = new WheelEvent('wheel', {
      deltaY: 40,
      cancelable: true,
    });
    fireEvent(viewport, ordinaryWheel);
    expect(ordinaryWheel.defaultPrevented).toBe(false);
    expect(engine.api.scrollNext).toHaveBeenCalledTimes(2);

    unmount();
    expect(removeListener).toHaveBeenCalledWith('wheel', expect.any(Function));
    const afterUnmount = new WheelEvent('wheel', {
      deltaY: 40,
      shiftKey: true,
      cancelable: true,
    });
    fireEvent(viewport, afterUnmount);
    expect(afterUnmount.defaultPrevented).toBe(false);
    expect(engine.api.scrollNext).toHaveBeenCalledTimes(2);
    expect(engine.api.scrollPrev).toHaveBeenCalledTimes(2);
  });
});
