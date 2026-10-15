import { useRef } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ComparisonScrollport from '@features/package-comparison-section/components/ComparisonScrollport';

vi.mock('@shared/components', async () => ({
  Button: (await import('@shared/components/ui/button')).Button,
}));
vi.mock(
  '@features/package-comparison-section/packageComparison.module.css',
  () => ({
    default: {
      content: 'comparison-content',
      scrollport: 'comparison-scrollport',
    },
  })
);

const callbacks = new Set<() => void>();
let contentWidth = 400;
const click = vi.fn();
const captures = new Set<number>();
const nativeMethods = [
  'scrollBy',
  'setPointerCapture',
  'hasPointerCapture',
  'releasePointerCapture',
] as const;
const originalMethods = nativeMethods.map(
  (name) =>
    [
      name,
      Object.getOwnPropertyDescriptor(HTMLElement.prototype, name),
    ] as const
);

/** Renders a scrollport with interactive children for drag and click regression checks. */
function Harness({ group = 'a', reducedMotion = true } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <ComparisonScrollport
      scrollRef={ref}
      groupKey={group}
      id='scroll-test'
      label='Compare packages'
      lang='en'
      reducedMotion={reducedMotion}
    >
      <div>
        <p>Package details</p>
        <button onClick={click}>CTA</button>
        <a
          href='https://example.com/contact'
          onClick={(event) => {
            event.preventDefault();
            click();
          }}
        >
          Contact
        </a>
        <button onClick={click}>More information</button>
      </div>
    </ComparisonScrollport>
  );
}

/** Dispatches a primary mouse pointer event with overridable gesture properties. */
function pointer(
  target: Element | Window,
  kind: 'pointerDown' | 'pointerMove' | 'pointerUp',
  x: number,
  options = {}
) {
  fireEvent[kind](target, {
    pointerId: 7,
    pointerType: 'mouse',
    isPrimary: true,
    button: 0,
    clientX: x,
    clientY: 10,
    ...options,
  });
}

beforeEach(() => {
  contentWidth = 400;
  callbacks.clear();
  captures.clear();
  click.mockClear();
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      pointerId: number;
      pointerType: string;
      isPrimary: boolean;
      constructor(type: string, options: PointerEventInit = {}) {
        super(type, options);
        this.pointerId = options.pointerId ?? 7;
        this.pointerType = options.pointerType ?? 'mouse';
        this.isPrimary = options.isPrimary ?? true;
      }
    }
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(
    () => contentWidth
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: () => void) {
        callbacks.add(callback);
      }
      observe() {}
      disconnect() {
        callbacks.delete(this.callback);
      }
    }
  );
  Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
    configurable: true,
    value: vi.fn(function (
      this: HTMLElement,
      options: ScrollToOptions | number
    ) {
      if (typeof options !== 'number') this.scrollLeft += options.left ?? 0;
      this.dispatchEvent(new Event('scroll'));
    }),
  });
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
    configurable: true,
    value: vi.fn((id: number) => {
      captures.add(id);
    }),
  });
  Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
    configurable: true,
    value: vi.fn((id: number) => captures.has(id)),
  });
  Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
    configurable: true,
    value: vi.fn((id: number) => {
      captures.delete(id);
    }),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  for (const [name, original] of originalMethods) {
    if (original) Object.defineProperty(HTMLElement.prototype, name, original);
    else Reflect.deleteProperty(HTMLElement.prototype, name);
  }
});

describe('comparison native scrolling', () => {
  it('shows click alternatives only when overflowing and updates their end states', () => {
    contentWidth = 100;
    render(<Harness />);
    expect(
      screen.queryByRole('button', { name: 'Scroll comparison right' })
    ).not.toBeInTheDocument();
    contentWidth = 400;
    act(() => callbacks.forEach((measure) => measure()));
    expect(
      screen.getByRole('button', { name: 'Scroll comparison left' })
    ).toBeDisabled();
    const right = screen.getByRole('button', {
      name: 'Scroll comparison right',
    });
    expect(right).toHaveAttribute('aria-controls', 'scroll-test');
    fireEvent.click(right);
    const scrollport = screen.getByTestId('comparison-scrollport');
    expect(scrollport.scrollLeft).toBe(80);
    expect(scrollport.scrollBy).toHaveBeenCalledWith({
      left: 80,
      behavior: 'auto',
    });
    expect(
      screen.getByRole('button', { name: 'Scroll comparison left' })
    ).toBeEnabled();
    scrollport.scrollLeft = 300;
    fireEvent.scroll(scrollport);
    expect(right).toBeDisabled();
  });

  it('waits for an intentional horizontal drag and suppresses only its compatibility click', async () => {
    render(<Harness />);
    const scrollport = screen.getByTestId('comparison-scrollport');
    scrollport.scrollLeft = 100;
    pointer(screen.getByText('Package details'), 'pointerDown', 100);
    pointer(window, 'pointerMove', 103);
    expect(scrollport.scrollLeft).toBe(100);
    expect(scrollport).toHaveAttribute('data-dragging', 'false');
    pointer(window, 'pointerMove', 140);
    expect(scrollport.scrollLeft).toBe(60);
    expect(scrollport).toHaveAttribute('data-dragging', 'true');
    expect(captures.has(7)).toBe(true);
    pointer(window, 'pointerUp', 140);
    fireEvent.click(screen.getByRole('button', { name: 'CTA' }), { detail: 1 });
    expect(click).not.toHaveBeenCalled();
    expect(captures.size).toBe(0);
    expect(scrollport).toHaveAttribute('data-dragging', 'false');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    fireEvent.click(screen.getByRole('button', { name: 'CTA' }), { detail: 1 });
    expect(click).toHaveBeenCalledTimes(1);
  });

  it.each(['CTA', 'Contact', 'More information'])(
    'keeps %s available for normal clicks and excludes it from dragging',
    (name) => {
      render(<Harness />);
      const target = screen.getByText(name);
      pointer(target, 'pointerDown', 100);
      pointer(window, 'pointerMove', 50);
      pointer(window, 'pointerUp', 50);
      expect(screen.getByTestId('comparison-scrollport').scrollLeft).toBe(0);
      expect(captures.size).toBe(0);
      fireEvent.click(target);
      expect(click).toHaveBeenCalledTimes(1);
    }
  );

  it.each(['touch', 'pen'])(
    'leaves %s panning to the browser',
    (pointerType) => {
      render(<Harness />);
      pointer(screen.getByText('Package details'), 'pointerDown', 100, {
        pointerType,
      });
      pointer(window, 'pointerMove', 50, { pointerType });
      expect(screen.getByTestId('comparison-scrollport').scrollLeft).toBe(0);
      expect(captures.size).toBe(0);
    }
  );

  it('ignores right mouse presses and vertical movement', () => {
    render(<Harness />);
    const target = screen.getByText('Package details');
    pointer(target, 'pointerDown', 100, { button: 2 });
    pointer(window, 'pointerMove', 50);
    pointer(window, 'pointerUp', 50);
    pointer(target, 'pointerDown', 100);
    pointer(window, 'pointerMove', 100, { clientY: 40 });
    pointer(window, 'pointerMove', 50, { clientY: 40 });
    expect(screen.getByTestId('comparison-scrollport').scrollLeft).toBe(0);
    expect(captures.size).toBe(0);
  });

  it('ends dragging when resizing makes the table fit', () => {
    render(<Harness />);
    const scrollport = screen.getByTestId('comparison-scrollport');
    pointer(screen.getByText('Package details'), 'pointerDown', 100);
    pointer(window, 'pointerMove', 50);
    expect(scrollport).toHaveAttribute('data-dragging', 'true');
    contentWidth = 100;
    act(() => callbacks.forEach((measure) => measure()));
    expect(scrollport).toHaveAttribute('data-dragging', 'false');
    expect(
      screen.queryByRole('button', { name: 'Scroll comparison right' })
    ).not.toBeInTheDocument();
    expect(captures.size).toBe(0);
  });

  it('cancels dragging on pointer cancellation and group changes without leaving a click guard', () => {
    const { rerender, unmount } = render(<Harness />);
    const scrollport = screen.getByTestId('comparison-scrollport');
    pointer(screen.getByText('Package details'), 'pointerDown', 100);
    pointer(window, 'pointerMove', 50);
    fireEvent.pointerCancel(window, { pointerId: 7 });
    expect(scrollport).toHaveAttribute('data-dragging', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'CTA' }), { detail: 1 });
    expect(click).toHaveBeenCalledTimes(1);
    pointer(screen.getByText('Package details'), 'pointerDown', 100);
    pointer(window, 'pointerMove', 50);
    rerender(<Harness group='b' />);
    const before = scrollport.scrollLeft;
    pointer(window, 'pointerMove', 20);
    expect(scrollport.scrollLeft).toBe(before);
    expect(scrollport).toHaveAttribute('data-dragging', 'false');
    expect(captures.size).toBe(0);
    unmount();
    expect(callbacks.size).toBe(0);
  });
});
