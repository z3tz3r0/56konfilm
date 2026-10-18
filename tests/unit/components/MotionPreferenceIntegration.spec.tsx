import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LogoShowcaseLogos from '@features/logo-showcase-section/components/LogoShowcaseLogos';
import PackageComparison from '@features/package-comparison-section/components/PackageComparison';
import type { ComparisonGroup } from '@features/package-comparison-section/types/packageComparisonBlock.types';
import type { Locale, SiteMode } from '@shared/config/preferences';
import type { LogoLoopProps } from '@shared/components/common/LogoLoop';
import CtaButton from '@shared/components/common/CtaButton';
import { comparisonFixture } from './packageComparison.fixtures';
import { mockReducedMotion } from '../../support/fixtures/reduced-motion';

// Observe real hook transitions; isolate unrelated overlays and browser geometry.
vi.mock('@shared/hooks', async () => import('@shared/hooks/useDeviceTier'));
vi.mock(
  '@features/package-comparison-section/packageComparison.module.css',
  () => ({ default: { scrollport: 'comparison-scrollport' } })
);
vi.mock('@shared/components', async () => ({
  ...(await import('@shared/components/ui/tabs')),
  ...(await import('@shared/components/ui/table')),
  ...(await import('@shared/components/ui/badge')),
  ...(await import('@shared/components/ui/button')),
  CtaButton: (props: ComponentProps<typeof CtaButton>) => (
    <CtaButton {...props} />
  ),
  AppTooltip: ({ children }: { children: ReactNode }) => children,
  LogoLoop: ({ paused }: LogoLoopProps) => (
    <div data-testid='integration-loop' data-paused={paused} />
  ),
}));
vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    alt = '',
    ...props
  }: ComponentProps<'img'> & { fill?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element -- Offline image stand-in.
    <img {...props} alt={alt} />
  ),
}));
vi.mock('next/link', () => ({
  default: (props: ComponentProps<'a'>) => <a {...props} />,
}));
vi.mock('next/navigation', () => ({
  usePathname: () => window.location.pathname,
  useSearchParams: () =>
    new URLSearchParams(
      useSyncExternalStore(
        (listener) => {
          window.addEventListener('popstate', listener);
          return () => window.removeEventListener('popstate', listener);
        },
        () => window.location.search,
        () => ''
      )
    ),
}));
vi.mock(
  '@features/package-comparison-section/components/PackageGroupControls',
  () => ({
    default: ({
      groups,
      animate,
      onChange,
    }: {
      groups: ComparisonGroup[];
      animate: boolean;
      onChange: (key: string) => void;
    }) => (
      <div data-testid='group-controls' data-animate={animate}>
        {groups.map((group) => (
          <button key={group._key} onClick={() => onChange(group._key)}>
            {group.label}
          </button>
        ))}
      </div>
    ),
  })
);
vi.mock(
  '@features/package-comparison-section/components/ComparisonStickyHeader',
  () => ({
    default: ({
      children,
      reducedMotion,
    }: {
      children: ReactNode;
      reducedMotion: boolean;
    }) => (
      <div data-testid='sticky-policy' data-reduced-motion={reducedMotion}>
        {children}
      </div>
    ),
  })
);

let motion: ReturnType<typeof mockReducedMotion>;
const scrollBy = vi.fn();
const originalScrollBy = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'scrollBy'
);
const logos = Array.from({ length: 7 }, (_, index) => ({
  id: String(index),
  src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
  alt: `Logo ${index}`,
}));

beforeEach(() => {
  motion = mockReducedMotion();
  vi.stubGlobal('navigator', {
    hardwareConcurrency: 8,
    connection: { saveData: false },
  });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    }
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(1200);
  Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
    configurable: true,
    value: scrollBy,
  });
  scrollBy.mockClear();
  window.history.replaceState({}, '', '/en/wedding/packages');
});
afterEach(() => {
  cleanup();
  expect(motion.listenerCount()).toBe(0);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScrollBy)
    Object.defineProperty(HTMLElement.prototype, 'scrollBy', originalScrollBy);
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollBy');
});

function renderConsumers(lang: Locale = 'en', mode: SiteMode = 'wedding') {
  return render(
    <>
      <LogoShowcaseLogos logos={logos} lang={lang} />
      <PackageComparison
        sectionKey='comparison'
        groups={comparisonFixture(lang).groups!}
        lang={lang}
        mode={mode}
      />
    </>
  );
}

describe('shared motion preference across Showcase and Comparison', () => {
  it.each([
    ['production', 'en'],
    ['production', 'th'],
    ['wedding', 'en'],
    ['wedding', 'th'],
  ] as const)(
    'updates animation and scroll policies without resetting interaction (%s/%s)',
    (mode, lang) => {
      const { unmount } = renderConsumers(lang, mode);
      expect(motion.listenerCount()).toBe(1);
      fireEvent.click(
        screen.getByRole('button', {
          name: lang === 'th' ? 'พรีเมียม' : 'Luxury',
        })
      );
      const cta = screen.getByRole('link', {
        name: lang === 'th' ? 'เริ่มต้น' : 'Get started',
      });
      cta.focus();
      const scrollport = screen.getByTestId('comparison-scrollport');
      scrollport.scrollLeft = 150;
      const url = window.location.href;
      const scrollPage = vi.spyOn(window, 'scrollTo');
      for (const reduced of [true, false, true, false]) {
        act(() => motion.set(reduced));
        expect(screen.getByTestId('group-controls')).toHaveAttribute(
          'data-animate',
          String(!reduced)
        );
        expect(screen.getByTestId('sticky-policy')).toHaveAttribute(
          'data-reduced-motion',
          String(reduced)
        );
        expect(screen.queryAllByTestId('integration-loop')).toHaveLength(
          reduced ? 0 : 2
        );
        if (reduced)
          expect(
            within(screen.getByTestId('logo-showcase-static')).getAllByRole(
              'img'
            )
          ).toHaveLength(7);
        expect(
          screen.getByRole('link', {
            name: lang === 'th' ? 'เริ่มต้น' : 'Get started',
          })
        ).toBe(cta);
        expect(cta).toHaveFocus();
        expect(screen.getByRole('table')).toHaveTextContent(
          lang === 'th' ? 'ครบชุด' : 'Complete'
        );
        expect(scrollport.scrollLeft).toBe(150);
        expect(window.location.href).toBe(url);
        fireEvent.click(
          screen.getByRole('button', {
            name:
              lang === 'th' ? 'เลื่อนตารางไปทางขวา' : 'Scroll comparison right',
          })
        );
        expect(scrollBy).toHaveBeenLastCalledWith({
          left: 320,
          behavior: reduced ? 'auto' : 'smooth',
        });
      }
      expect(scrollPage).not.toHaveBeenCalled();
      unmount();
      expect(motion.listenerCount()).toBe(0);
    }
  );

  it.each(['hardware', 'data saver'])(
    'does not mistake %s constraints for reduced-motion preference',
    (constraint) => {
      vi.stubGlobal('navigator', {
        hardwareConcurrency: constraint === 'hardware' ? 2 : 8,
        connection: { saveData: constraint === 'data saver' },
      });
      renderConsumers();
      expect(screen.getByTestId('group-controls')).toHaveAttribute(
        'data-animate',
        'false'
      );
      expect(screen.queryAllByTestId('integration-loop')).toHaveLength(0);
      for (const reduced of [false, true, false]) {
        act(() => motion.set(reduced));
        expect(screen.getByTestId('sticky-policy')).toHaveAttribute(
          'data-reduced-motion',
          String(reduced)
        );
        expect(screen.getByTestId('group-controls')).toHaveAttribute(
          'data-animate',
          'false'
        );
        expect(screen.queryAllByTestId('integration-loop')).toHaveLength(0);
        fireEvent.click(
          screen.getByRole('button', { name: 'Scroll comparison right' })
        );
        expect(scrollBy).toHaveBeenLastCalledWith({
          left: 320,
          behavior: reduced ? 'auto' : 'smooth',
        });
      }
    }
  );

  it('starts reduced, resumes when allowed, and preserves an explicit pause through later changes', () => {
    motion.set(true);
    renderConsumers();
    expect(screen.queryAllByTestId('integration-loop')).toHaveLength(0);
    act(() => motion.set(false));
    expect(screen.getAllByTestId('integration-loop')).toHaveLength(2);
    const loops = screen.getAllByTestId('integration-loop');
    fireEvent.click(
      screen.getByRole('button', { name: 'Pause logo animation' })
    );
    expect(screen.getAllByTestId('integration-loop')).toEqual(loops);
    act(() => motion.set(true));
    act(() => motion.set(false));
    expect(
      screen.getByRole('button', { name: 'Play logo animation' })
    ).toHaveAttribute('aria-pressed', 'true');
    screen
      .getAllByTestId('integration-loop')
      .forEach((loop) => expect(loop).toHaveAttribute('data-paused', 'true'));
  });
});
