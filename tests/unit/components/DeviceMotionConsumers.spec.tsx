import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '@shared/providers/MotionProvider';
import VideoLoop from '@shared/components/common/VideoLoop';
import VideoItem from '@features/media-gallery-section/components/grid/VideoItem';
import AnimatedPortfolioGrid from '@shared/components/common/portfolio-grid/AnimatedPortfolioGrid';
import AnimatedCollageImage from '@features/media-gallery-section/components/collage/AnimatedCollageImage';
import ContactSection from '@features/contact-section/ContactSection';
import StatsCounterSection from '@features/stats-counter-section/components/StatsCounterSection';
import AwardsSection from '@features/awards-section/components/AwardsSection';
import CapabilitiesSection from '@features/capabilities-section/components/CapabilitiesSection';
import ProcessSection from '@features/process-section/components/ProcessSection';
import TeamSection from '@features/team-section/TeamSection';
import GalleryGrid from '@features/media-gallery-section/components/grid/Grid';
import { mockReducedMotion } from '../../support/fixtures/reduced-motion';

// Avoid unrelated integrations in barrels, but use the real hook and Motion runtime.
vi.mock('@shared/hooks', async () => import('@shared/hooks/useDeviceTier'));
vi.mock('@shared/components', () => ({
  SectionShell: ({ children }: { children: ReactNode }) => (
    <section>{children}</section>
  ),
  SectionHeader: () => null,
  AppIcon: () => null,
  CtaGroup: () => null,
}));
vi.mock('next/navigation', () => ({ useParams: () => ({ lang: 'en' }) }));
vi.mock('@shared/components/common/DynamicLucideIcon', () => ({
  DynamicLucideIcon: () => null,
}));
vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    priority: _priority,
    alt = '',
    ...props
  }: ComponentProps<'img'> & { fill?: boolean; priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element -- Local stand-in for next/image, not production markup.
    <img {...props} alt={alt} />
  ),
}));
vi.mock('@/sanity/lib/image', () => ({
  urlFor: () => {
    throw new Error('No CMS media in this fixture.');
  },
}));
vi.mock('@features/contact-section/components', () => ({
  ContactForm: function ContactForm() {
    const [value, setValue] = useState('');
    return (
      <input
        aria-label='Inquiry'
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    );
  },
}));

let motion: ReturnType<typeof mockReducedMotion>;
let observers: Array<{
  callback: IntersectionObserverCallback;
  targets: Set<Element>;
}>;

function intersect(element: Element, visible: boolean) {
  for (const observer of observers) {
    if (observer.targets.has(element)) {
      observer.callback(
        [
          {
            target: element,
            isIntersecting: visible,
            intersectionRatio: visible ? 1 : 0,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    }
  }
}

beforeEach(() => {
  motion = mockReducedMotion();
  vi.stubGlobal('navigator', { hardwareConcurrency: 8 });
  observers = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      targets = new Set<Element>();
      constructor(callback: IntersectionObserverCallback) {
        observers.push({ callback, targets: this.targets });
      }
      observe(element: Element) {
        this.targets.add(element);
      }
      unobserve(element: Element) {
        this.targets.delete(element);
      }
      disconnect() {
        this.targets.clear();
      }
    }
  );
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  expect(motion.listenerCount()).toBe(0);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('real device-tier consumers during preference changes', () => {
  it('resets video loading and releases the old observer before restoring autoplay', () => {
    render(<VideoLoop url='/fixture.mp4' posterUrl='/poster.png' />);
    const first = screen.getByTestId<HTMLVideoElement>('video-loop');
    act(() => intersect(first, true));
    expect(first.play).toHaveBeenCalled();
    fireEvent.canPlay(first);
    expect(first).toHaveClass('opacity-100');
    act(() => motion.set(true));
    expect(screen.queryByTestId('video-loop')).toBeNull();
    expect(screen.getByTestId('video-poster-fallback')).toBeInTheDocument();
    expect(observers.some((observer) => observer.targets.has(first))).toBe(
      false
    );
    expect(first.pause).toHaveBeenCalled();
    act(() => motion.set(false));
    const restored = screen.getByTestId('video-loop');
    expect(restored).not.toBe(first);
    expect(restored).toHaveClass('opacity-0');
    act(() => intersect(restored, true));
    fireEvent.canPlay(restored);
    expect(restored).toHaveClass('opacity-100');
  });

  it('observes the restored gallery video and pauses it after leaving the viewport', () => {
    render(<VideoItem src='/fixture.mp4' />);
    const first = screen.getByTestId('video-item');
    act(() => intersect(first, true));
    act(() => motion.set(true));
    expect(screen.getByTestId('video-item-fallback')).toBeInTheDocument();
    expect(observers.some((observer) => observer.targets.has(first))).toBe(
      false
    );
    act(() => motion.set(false));
    const restored = screen.getByTestId<HTMLVideoElement>('video-item');
    expect(observers.some((observer) => observer.targets.has(restored))).toBe(
      true
    );
    act(() => intersect(restored, true));
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    act(() => intersect(restored, false));
    expect(restored.pause).toHaveBeenCalled();
  });

  it.each(['portfolio', 'collage'] as const)(
    'preserves DOM identity, focus and child state in %s',
    async (kind) => {
      function Card() {
        const [count, setCount] = useState(0);
        return (
          <button onClick={() => setCount((value) => value + 1)}>
            Project {count}
          </button>
        );
      }
      render(
        <MotionProvider>
          {kind === 'portfolio' ? (
            <AnimatedPortfolioGrid className='grid'>
              <Card />
            </AnimatedPortfolioGrid>
          ) : (
            <AnimatedCollageImage className='frame' order={0}>
              <Card />
            </AnimatedCollageImage>
          )}
        </MotionProvider>
      );
      const card = screen.getByRole('button');
      fireEvent.click(card);
      card.focus();
      for (const reduced of [true, false, true]) {
        act(() => motion.set(reduced));
        expect(screen.getByRole('button')).toBe(card);
        expect(card).toHaveFocus();
        expect(card).toHaveTextContent('Project 1');
        if (reduced) {
          await waitFor(() => {
            const animated = card.parentElement!;
            expect(animated).toHaveStyle({ opacity: '1' });
            expect(animated.style.transform).not.toMatch(/translateY\((?!0px)/);
          });
        }
      }
    }
  );

  it('keeps entered contact data and focus while motion flags change', () => {
    render(
      <MotionProvider>
        <ContactSection
          block={{
            _type: 'contactSection',
            showForm: true,
            channels: [
              { _key: 'email', label: 'Email', value: 'studio@example.test' },
            ],
          }}
        />
      </MotionProvider>
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Our wedding inquiry' } });
    input.focus();
    for (const reduced of [true, false, true]) {
      act(() => motion.set(reduced));
      expect(screen.getByRole('textbox')).toBe(input);
      expect(input).toHaveValue('Our wedding inquiry');
      expect(input).toHaveFocus();
    }
  });

  it.each([
    'stats',
    'awards',
    'capabilities',
    'process grid',
    'process timeline',
    'team',
    'gallery',
    'contact',
  ] as const)(
    'does not leave %s hidden when reduction is enabled before entry',
    async (kind) => {
      const fixtures = {
        stats: (
          <StatsCounterSection
            block={{
              _type: 'statsCounterSection',
              stats: [{ _key: 'projects', value: '100', label: 'Projects' }],
            }}
          />
        ),
        awards: (
          <AwardsSection
            block={{
              _type: 'awardsSection',
              awards: [{ _key: 'award', name: 'Award' }],
            }}
          />
        ),
        capabilities: (
          <CapabilitiesSection
            block={{
              _type: 'capabilitiesSection',
              layout: 'grid',
              features: [{ _key: 'feature', title: 'Feature' }],
            }}
          />
        ),
        'process grid': (
          <ProcessSection
            block={{
              _type: 'processSection',
              layout: 'numbered',
              steps: [{ _key: 'step', title: 'Step' }],
            }}
          />
        ),
        'process timeline': (
          <ProcessSection
            block={{
              _type: 'processSection',
              layout: 'timeline',
              steps: [{ _key: 'step', title: 'Step' }],
            }}
          />
        ),
        team: (
          <TeamSection
            lang='en'
            block={{
              _type: 'teamSection',
              members: [{ _key: 'member', name: 'Member', role: 'Director' }],
            }}
          />
        ),
        gallery: (
          <GalleryGrid
            lang='en'
            mode='production'
            block={{
              _type: 'mediaGallerySection',
              heading: { heading: 'Gallery' },
              items: [
                {
                  _key: 'video',
                  mediaType: 'video',
                  videoUrl: '/fixture.mp4',
                  label: 'Gallery video',
                },
              ],
            }}
          />
        ),
        contact: (
          <ContactSection
            block={{
              _type: 'contactSection',
              channels: [
                { _key: 'email', label: 'Email', value: 'studio@example.test' },
              ],
            }}
          />
        ),
      };
      render(<MotionProvider>{fixtures[kind]}</MotionProvider>);
      const testIds = {
        stats: 'stat-item',
        awards: 'award-item',
        capabilities: 'feature-grid-item',
        'process grid': 'process-step',
        'process timeline': 'process-step',
        team: 'team-member',
        gallery: 'gallery-item-video',
        contact: 'contact-channel-card',
      };
      const item = screen.getByTestId(testIds[kind]);
      act(() => motion.set(true));
      await waitFor(() => {
        let element: HTMLElement | null = item;
        while (element) {
          expect(getComputedStyle(element).opacity).not.toBe('0');
          element = element.parentElement;
        }
      });
      expect(item).toBeInTheDocument();
    }
  );
});
