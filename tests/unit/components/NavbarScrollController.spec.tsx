import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NavbarScrollController from '@shared/components/layout/navbar/NavbarScrollController';

let height = 80;
const observers = new Set<() => void>();
const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY');
/** Sets the mocked vertical scroll position and dispatches a scroll event. */
function scroll(y: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  fireEvent.scroll(window);
}
beforeEach(() => {
  height = 80;
  observers.clear();
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({
      width: 375,
      height,
      top: 0,
      bottom: height,
      left: 0,
      right: 375,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
  );
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
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScrollY)
    Object.defineProperty(window, 'scrollY', originalScrollY);
  for (const name of [
    '--navbar-height',
    '--navbar-visible-height',
    '--navbar-transition-duration',
    '--navbar-transition-easing',
  ])
    document.documentElement.style.removeProperty(name);
});

describe('Navbar CSS layout metrics', () => {
  it('publishes actual height and occupied space when the existing hide/show behavior changes', () => {
    render(
      <NavbarScrollController>
        <nav>Menu</nav>
      </NavbarScrollController>
    );
    const style = document.documentElement.style;
    expect(style.getPropertyValue('--navbar-height')).toBe('80px');
    expect(style.getPropertyValue('--navbar-visible-height')).toBe('80px');
    scroll(450);
    expect(style.getPropertyValue('--navbar-visible-height')).toBe('0px');
    scroll(420);
    expect(style.getPropertyValue('--navbar-visible-height')).toBe('80px');
  });
  it('updates metrics on resize and restores prior properties on unmount', () => {
    document.documentElement.style.setProperty('--navbar-height', '15px');
    const { unmount } = render(
      <NavbarScrollController>
        <nav>Menu</nav>
      </NavbarScrollController>
    );
    height = 96;
    act(() => observers.forEach((callback) => callback()));
    expect(
      document.documentElement.style.getPropertyValue('--navbar-visible-height')
    ).toBe('96px');
    unmount();
    expect(
      document.documentElement.style.getPropertyValue('--navbar-height')
    ).toBe('15px');
    expect(observers.size).toBe(0);
  });
});
