import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { useEffect, type ComponentProps, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LogoShowcaseSection from '@features/logo-showcase-section/LogoShowcaseSection';
import LogoShowcaseLogos from '@features/logo-showcase-section/components/LogoShowcaseLogos';
import type { LogoShowcaseSectionBlock } from '@features/logo-showcase-section';
import SectionHeader from '@shared/components/common/section-header';
import { Button } from '@shared/components/ui/button';
import type { LogoLoopProps } from '@shared/components/common/LogoLoop';

const mocks = vi.hoisted(() => ({
  tier: { isInitialized: true, allowHeavyMotion: true },
  mount: vi.fn(),
  unmount: vi.fn(),
  url: vi.fn(),
}));
vi.mock('@shared/hooks/useDeviceTier', () => ({
  useDeviceTier: () => mocks.tier,
}));
vi.mock('@shared/components', () => ({
  SectionHeader: (props: ComponentProps<typeof SectionHeader>) => (
    <SectionHeader {...props} />
  ),
  SectionShell: ({
    children,
    background,
    sanityType,
    dataTestId,
  }: {
    children: ReactNode;
    background?: string;
    sanityType: string;
    dataTestId: string;
  }) => (
    <section
      data-background={background}
      data-sanity-type={sanityType}
      data-testid={dataTestId}
    >
      {children}
    </section>
  ),
  Button: (props: ComponentProps<typeof Button>) => <Button {...props} />,
  LogoLoop: function MockLoop({ logos, ...props }: LogoLoopProps) {
    useEffect(() => {
      mocks.mount();
      return () => {
        mocks.unmount();
      };
    }, []);
    return (
      <div data-testid='loop' data-options={JSON.stringify(props)}>
        {logos.map((item, i) => (
          <span key={i}>{'node' in item ? item.node : null}</span>
        ))}
      </div>
    );
  },
}));
vi.mock('@/sanity/lib/image', () => ({
  urlFor: (image: unknown) => {
    mocks.url(image);
    const builder = {
      width: vi.fn(() => builder),
      fit: vi.fn(() => builder),
      url: () => 'https://fixture.invalid/logo.svg',
    };
    return builder;
  },
}));
vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    ...props
  }: ComponentProps<'img'> & { fill?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element -- Deliberate next/image test double.
    <img {...props} alt={props.alt ?? ''} />
  ),
}));

let reduced: boolean;
let listeners: Set<() => void>;
const fixture = (count: number): LogoShowcaseSectionBlock => ({
  _type: 'logoShowcaseSection',
  background: 'contrast',
  heading: {
    eyebrow: 'Our clients',
    heading: 'Brands [that trust us]',
    body: 'CMS body',
  },
  logos: Array.from({ length: count }, (_, i) => ({
    _key: `logo-${i}`,
    image: { asset: { _ref: `image-${i}-100x100-svg` } },
    alt: `Brand ${i}`,
  })),
});
beforeEach(() => {
  reduced = false;
  listeners = new Set();
  mocks.tier = { isInitialized: true, allowHeavyMotion: true };
  vi.clearAllMocks();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      get matches() {
        return reduced;
      },
      addEventListener: (_event: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_event: string, fn: () => void) =>
        listeners.delete(fn),
    }))
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Logo Showcase content and row allocation', () => {
  it.each([
    [0, []],
    [1, [1]],
    [6, [6]],
    [7, [4, 3]],
    [13, [7, 6]],
    [20, [10, 10]],
    [21, [11, 10]],
  ])('keeps all %i valid logos in ordered, balanced rows', (count, sizes) => {
    render(<LogoShowcaseSection block={fixture(count as number)} lang='en' />);
    const loops = screen.queryAllByTestId('loop');
    expect(
      loops.map((loop) => within(loop).queryAllByRole('img').length)
    ).toEqual(sizes);
    expect(
      loops.flatMap((loop) =>
        within(loop)
          .queryAllByRole('img')
          .map((img) => img.getAttribute('alt'))
      )
    ).toEqual(Array.from({ length: count as number }, (_, i) => `Brand ${i}`));
    expect(mocks.url).toHaveBeenCalledTimes(count as number);
  });
  it('counts only valid images and keeps surviving order and alt text', () => {
    const block = fixture(7);
    block.logos![2].image = undefined;
    block.logos![0].alt = '';
    render(<LogoShowcaseSection block={block} lang='th' />);
    const loop = screen.getByTestId('loop');
    expect(loop.querySelectorAll('img')).toHaveLength(6);
    expect(
      Array.from(loop.querySelectorAll('img')).map((img) => img.alt)
    ).toEqual(['', 'Brand 1', 'Brand 3', 'Brand 4', 'Brand 5', 'Brand 6']);
  });
  it('uses standard SectionHeader typography without local size overrides', () => {
    render(<LogoShowcaseSection block={fixture(1)} lang='en' />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass(
      'text-3xl',
      'md:text-4xl'
    );
    expect(screen.getByText('Our clients')).toHaveClass('text-sm');
    expect(screen.getByText('CMS body')).toHaveClass('text-base');
    expect(screen.getByTestId('logo-showcase-section')).toHaveAttribute(
      'data-background',
      'contrast'
    );
  });
  it('falls back to the legacy title without dropping optional eyebrow/body', () => {
    const block = fixture(0);
    block.title = 'Legacy heading';
    block.heading!.heading = '';
    render(<LogoShowcaseSection block={block} lang='en' />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Legacy heading'
    );
    expect(screen.getByText('Our clients')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('accepts empty optional content', () => {
    render(
      <LogoShowcaseSection block={{ _type: 'logoShowcaseSection' }} lang='en' />
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('logo-showcase-logos')).not.toBeInTheDocument();
  });
});

describe('Logo Showcase motion controls', () => {
  it('applies Minimal settings with opposite directions and no extra opacity', () => {
    render(<LogoShowcaseSection block={fixture(7)} lang='en' />);
    screen.getAllByTestId('loop').forEach((loop, index) => {
      expect(JSON.parse(loop.dataset.options!)).toMatchObject({
        speed: 20,
        direction: index ? 'left' : 'right',
        layout: 'line',
        logoHeight: 36,
        gap: 72,
        muted: 0.6,
        scaleOnHover: false,
        intro: true,
        draggable: true,
        fadeOut: true,
        fadeOutWidth: 0.12,
        hoverSpeed: 0,
        paused: false,
      });
      expect(loop.querySelector('img')).toHaveClass('object-contain');
      expect(loop.querySelector('img')!.parentElement!.className).not.toMatch(
        /opacity/
      );
    });
  });
  it.each(['en', 'th'] as const)(
    'toggles one shared, localized control without remounting (%s)',
    (lang) => {
      render(<LogoShowcaseSection block={fixture(7)} lang={lang} />);
      const loops = screen.getAllByTestId('loop');
      const pause =
        lang === 'en' ? 'Pause logo animation' : 'หยุดภาพเคลื่อนไหวโลโก้';
      const play =
        lang === 'en' ? 'Play logo animation' : 'เล่นภาพเคลื่อนไหวโลโก้';
      fireEvent.click(screen.getByRole('button', { name: pause }));
      expect(screen.getByRole('button', { name: play })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      loops.forEach((loop) =>
        expect(JSON.parse(loop.dataset.options!).paused).toBe(true)
      );
      fireEvent.pointerLeave(loops[0]);
      expect(JSON.parse(loops[0].dataset.options!).paused).toBe(true);
      fireEvent.click(screen.getByRole('button', { name: play }));
      expect(screen.getAllByTestId('loop')).toEqual(loops);
      expect(mocks.mount).toHaveBeenCalledTimes(2);
      expect(mocks.unmount).not.toHaveBeenCalled();
    }
  );
  it.each(['initializing', 'low tier', 'reduced motion'])(
    'keeps every logo available without controls for %s',
    (state) => {
      mocks.tier = {
        isInitialized: state !== 'initializing',
        allowHeavyMotion: state !== 'low tier',
      };
      reduced = state === 'reduced motion';
      render(<LogoShowcaseSection block={fixture(20)} lang='en' />);
      expect(screen.queryByTestId('loop')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(
        within(screen.getByTestId('logo-showcase-static')).getAllByRole('img')
      ).toHaveLength(20);
    }
  );
  it('reacts to preference changes, retains manual pause, and cleans up the media listener', () => {
    const { unmount } = render(
      <LogoShowcaseSection block={fixture(7)} lang='en' />
    );
    fireEvent.click(screen.getByRole('button'));
    act(() => {
      reduced = true;
      listeners.forEach((fn) => fn());
    });
    expect(screen.queryByTestId('loop')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    act(() => {
      reduced = false;
      listeners.forEach((fn) => fn());
    });
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    unmount();
    expect(listeners.size).toBe(0);
  });
  it('renders no controls for a direct empty list', () => {
    const { container } = render(<LogoShowcaseLogos logos={[]} lang='en' />);
    expect(container).toBeEmptyDOMElement();
  });
});
