import { act, cleanup, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useSyncExternalStore } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AnimatedPortfolioGrid from '@shared/components/common/portfolio-grid/AnimatedPortfolioGrid';
import { MotionProvider } from '@shared/providers/MotionProvider';

const snapshots = vi.hoisted(() => ({
  server: { isInitialized: false, allowHeavyMotion: false },
  client: { isInitialized: true, allowHeavyMotion: false },
}));

vi.mock('@shared/hooks', () => ({
  useDeviceTier: () =>
    useSyncExternalStore(
      () => () => {},
      () => snapshots.client,
      () => snapshots.server
    ),
}));

describe('AnimatedPortfolioGrid hydration with real Motion', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('hydrates the SSR snapshot and reveals static cards for low-tier devices without a mismatch', async () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    const ui = (
      <MotionProvider>
        <AnimatedPortfolioGrid className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          <a key='first' href='https://example.test/first'>
            First project
          </a>
          <a key='second' href='https://example.test/second'>
            Second project
          </a>
        </AnimatedPortfolioGrid>
      </MotionProvider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(ui);
    document.body.append(container);
    expect(container.querySelector('section')).toHaveStyle({ opacity: '0' });
    const errors = vi.spyOn(console, 'error');
    await act(async () => {
      render(ui, { container, hydrate: true });
    });
    const grid = container.querySelector('section')!;
    expect(grid).not.toHaveAttribute('style');
    expect(grid.children).toHaveLength(2);
    expect(grid.firstElementChild?.tagName).toBe('A');
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(
      ['First project', 'Second project']
    );
    expect(errors).not.toHaveBeenCalled();
  });
});
