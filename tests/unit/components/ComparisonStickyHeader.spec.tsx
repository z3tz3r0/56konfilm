import { useRef } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ComparisonStickyHeader from '@features/package-comparison-section/components/ComparisonStickyHeader';
import PackageHeader from '@features/package-comparison-section/components/PackageHeader';
import { comparisonFixture } from './packageComparison.fixtures';

vi.mock('@shared/components', async () => ({
  Button: (await import('@shared/components/ui/button')).Button,
  Badge: (await import('@shared/components/ui/badge')).Badge,
  CtaButton: ({ ctaButton }: { ctaButton: { label: string } }) => (
    <button>{ctaButton.label}</button>
  ),
}));
vi.mock(
  '@features/package-comparison-section/packageComparison.module.css',
  () => ({ default: {} })
);

let top = 300;
let desktop = false;
let widths = [200, 230, 240];
const observers = new Set<() => void>();
const frames = new Map<number, FrameRequestCallback>();
let nextFrame = 0;
const mediaListeners = new Set<() => void>();

/** Runs the queued animation frame callbacks inside act for deterministic geometry updates. */
function flush() {
  act(() => {
    const tasks = [...frames.values()];
    frames.clear();
    tasks.forEach((task) => task(0));
  });
}

/** Pairs a sticky header with a semantic fixture table to test geometry, scrolling, and focus. */
function Harness({ group = comparisonFixture().groups![0] } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const hasGroupBadge = group.packages.some((item) => item.badgeLabel?.trim());
  return (
    <ComparisonStickyHeader
      scrollRef={ref}
      group={group}
      hasGroupBadge={hasGroupBadge}
      lang='en'
      mode='wedding'
      label='Package comparison'
      id='comparison'
      reducedMotion
    >
      <div
        ref={ref}
        data-testid='comparison-scrollport'
        tabIndex={0}
        role='region'
        aria-label='Comparison body'
      >
        <div data-slot='table-container'>
          <table>
            <thead>
              <tr
                style={{ gridTemplateRows: '40px 100px 60px', rowGap: '16px' }}
              >
                <th data-column='0' scope='col'>
                  Package comparison
                </th>
                {group.packages.map((item, index) => (
                  <th
                    key={item._id}
                    data-column={index + 1}
                    scope='col'
                    id={`package-${item._id}`}
                  >
                    <PackageHeader
                      packageData={item}
                      lang='en'
                      mode='wedding'
                      hasGroupBadge={hasGroupBadge}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope='row'>Photography</th>
                {group.packages.map((item) => (
                  <td key={item._id} headers={`package-${item._id}`}>
                    Included
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ComparisonStickyHeader>
  );
}

beforeEach(() => {
  top = 300;
  desktop = false;
  widths = [200, 230, 240];
  observers.clear();
  frames.clear();
  mediaListeners.clear();
  document.documentElement.style.setProperty('--navbar-visible-height', '60px');
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames.delete(id);
  });
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return desktop;
    },
    addEventListener(_: string, listener: () => void) {
      mediaListeners.add(listener);
    },
    removeEventListener(_: string, listener: () => void) {
      mediaListeners.delete(listener);
    },
  }));
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: () => void) {
        observers.add(callback);
      }
      observe() {}
      disconnect() {
        observers.delete(this.callback);
      }
    }
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(375);
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(
    () => widths.reduce((a, b) => a + b, 0) + 32
  );
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      const column = this.getAttribute('data-column');
      const width =
        column !== null
          ? widths[Number(column)]
          : widths.reduce((a, b) => a + b, 0);
      const height = this.tagName === 'THEAD' ? 232 : 1200;
      const y =
        this.tagName === 'TABLE' || this.tagName === 'THEAD' ? top + 1 : top;
      return {
        width,
        height,
        top: y,
        bottom: y + height,
        left: 0,
        right: width,
        x: 0,
        y,
        toJSON: () => ({}),
      };
    }
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.documentElement.style.removeProperty('--navbar-visible-height');
});

describe('mobile comparison sticky header', () => {
  it('uses the measured header columns and keeps one active CTA set and canonical table headers', () => {
    top = 20;
    render(<Harness />);
    const source = screen.getByTestId('comparison-scrollport');
    const floating = screen.getByTestId('comparison-sticky-scrollport');
    expect(screen.getByTestId('comparison-sticky-header')).toHaveAttribute(
      'data-active',
      'true'
    );
    expect(
      floating.querySelector('[style*="grid-template-columns"]')
    ).toHaveStyle({ gridTemplateColumns: '200px 230px 240px' });
    expect(source.querySelectorAll('[inert]')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Get started' })).toHaveLength(
      2
    );
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.getAllByRole('cell', { name: 'Included' })).toHaveLength(2);
  });

  it('synchronizes native horizontal scroll in both directions', () => {
    top = 20;
    render(<Harness />);
    const source = screen.getByTestId('comparison-scrollport');
    const floating = screen.getByTestId('comparison-sticky-scrollport');
    source.scrollLeft = 150;
    fireEvent.scroll(source);
    expect(floating.scrollLeft).toBe(150);
    floating.scrollLeft = 220;
    fireEvent.scroll(floating);
    expect(source.scrollLeft).toBe(220);
    fireEvent.scroll(source);
    expect(floating.scrollLeft).toBe(220);
  });

  it('does not let a delayed synchronization echo overwrite a newer header gesture', () => {
    top = 20;
    render(<Harness />);
    const source = screen.getByTestId('comparison-scrollport');
    const floating = screen.getByTestId('comparison-sticky-scrollport');
    floating.scrollLeft = 20;
    fireEvent.scroll(floating);
    expect(source.scrollLeft).toBe(20);
    floating.scrollLeft = 70;
    fireEvent.scroll(source);
    expect(floating.scrollLeft).toBe(70);
    fireEvent.scroll(floating);
    expect(source.scrollLeft).toBe(70);
  });

  it('preserves an in-flight header gesture while remeasuring columns', () => {
    top = 20;
    render(<Harness />);
    const source = screen.getByTestId('comparison-scrollport');
    const floating = screen.getByTestId('comparison-sticky-scrollport');
    floating.scrollLeft = 20;
    fireEvent.scroll(floating);
    floating.scrollLeft = 70;
    widths = [220, 250, 260];
    act(() => observers.forEach((callback) => callback()));
    flush();
    expect(floating.scrollLeft).toBe(70);
    fireEvent.scroll(source);
    expect(floating.scrollLeft).toBe(70);
    fireEvent.scroll(floating);
    expect(source.scrollLeft).toBe(70);
  });

  it('moves CTA focus to its counterpart on activation and back at the end without scrolling', () => {
    render(<Harness />);
    const source = screen.getByTestId('comparison-scrollport');
    const original = within(source).getAllByRole('button', {
      name: 'Get started',
    })[0];
    original.focus();
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    top = 20;
    fireEvent.scroll(window);
    flush();
    expect(
      within(screen.getByTestId('comparison-sticky-scrollport')).getAllByRole(
        'button',
        { name: 'Get started' }
      )[0]
    ).toHaveFocus();
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: true });
    top = -1300;
    fireEvent.scroll(window);
    flush();
    expect(
      screen.queryByTestId('comparison-sticky-scrollport')
    ).not.toBeInTheDocument();
    expect(original).toHaveFocus();
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: true });
    expect(source.querySelectorAll('[inert]')).toHaveLength(0);
  });

  it('returns focused CTA to the table when resizing to desktop', () => {
    top = 20;
    render(<Harness />);
    within(screen.getByTestId('comparison-sticky-scrollport'))
      .getAllByRole('button', { name: 'Get started' })[0]
      .focus();
    desktop = true;
    act(() => mediaListeners.forEach((listener) => listener()));
    flush();
    expect(
      screen.queryByTestId('comparison-sticky-scrollport')
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId('comparison-scrollport')).getAllByRole(
        'button',
        { name: 'Get started' }
      )[0]
    ).toHaveFocus();
  });

  it('remeasures columns even when a scroll event arrives in the same frame', () => {
    top = 20;
    render(<Harness />);
    widths = [220, 250, 260];
    act(() => observers.forEach((callback) => callback()));
    fireEvent.scroll(window);
    flush();
    expect(
      screen
        .getByTestId('comparison-sticky-scrollport')
        .querySelector('[style*="grid-template-columns"]')
    ).toHaveStyle({ gridTemplateColumns: '220px 250px 260px' });
  });

  it('falls back to the scroll region when a focused package disappears on group change', () => {
    top = 20;
    const { rerender } = render(<Harness />);
    within(screen.getByTestId('comparison-sticky-scrollport'))
      .getAllByRole('button', { name: 'Get started' })[0]
      .focus();
    rerender(<Harness group={comparisonFixture().groups![1]} />);
    expect(screen.getByTestId('comparison-scrollport')).toHaveFocus();
    expect(
      within(screen.getByTestId('comparison-scrollport')).getByText('Complete')
    ).toBeInTheDocument();
  });

  it('keeps the original header on desktop and when a zoomed viewport cannot fit the sticky header', () => {
    top = 20;
    desktop = true;
    const { unmount } = render(<Harness />);
    expect(
      screen.queryByTestId('comparison-sticky-scrollport')
    ).not.toBeInTheDocument();
    unmount();
    desktop = false;
    vi.stubGlobal('innerHeight', 200);
    render(<Harness />);
    expect(
      screen.queryByTestId('comparison-sticky-scrollport')
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Get started' })).toHaveLength(
      2
    );
  });
});
