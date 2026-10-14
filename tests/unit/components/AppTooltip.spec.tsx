import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AppTooltip from '@shared/components/common/AppTooltip';

function mediaFixture(matches: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches,
    addEventListener: (_: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      listeners.delete(listener),
  };
  vi.stubGlobal('matchMedia', () => media);
  return {
    change: (next: boolean) => {
      media.matches = next;
      act(() => listeners.forEach((listener) => listener()));
    },
    listeners,
  };
}

const info = (
  <AppTooltip content={'Line one\nLine two'}>
    <button type='button'>Details</button>
  </AppTooltip>
);
beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('AppTooltip responsive information', () => {
  it('uses hover-capable desktop tooltips with keyboard focus and Escape dismissal', async () => {
    mediaFixture(true);
    render(info);
    const trigger = screen.getByRole('button', { name: 'Details' });
    act(() => trigger.focus());
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.textContent).toBe('Line one\nLine two');
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('uses touch popovers and closes the previous overlay after a breakpoint/capability change', async () => {
    const media = mediaFixture(false);
    const { unmount } = render(info);
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('Line one');
    media.change(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    unmount();
    expect(media.listeners.size).toBe(0);
  });

  it('keeps SSR hydration stable when the browser supports hover', async () => {
    mediaFixture(true);
    const container = document.createElement('div');
    container.innerHTML = renderToString(info);
    document.body.append(container);
    const errors = vi.spyOn(console, 'error');
    await act(async () => {
      render(info, { hydrate: true, container });
    });
    expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument();
    expect(errors).not.toHaveBeenCalled();
  });

  it('does not attach an overlay for an empty description', () => {
    mediaFixture(false);
    render(
      <AppTooltip content=' '>
        <button>Details</button>
      </AppTooltip>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
