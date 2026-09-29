import { cleanup, render } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RouteScrollController from '@shared/components/layout/RouteScrollController';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));

const mockedUsePathname = vi.mocked(usePathname);

describe('RouteScrollController', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/en/production/about');
    mockedUsePathname.mockReturnValue('/en/production/about');
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('does not scroll on initial load, refresh, or query-only changes', () => {
    const view = render(<RouteScrollController />);

    view.rerender(<RouteScrollController />);
    window.history.replaceState({}, '', '/en/production/about?limit=15');
    view.rerender(<RouteScrollController />);

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls once after forward navigation to another pathname, before Portfolio query sync', () => {
    const view = render(<RouteScrollController />);

    mockedUsePathname.mockReturnValue('/en/production/portfolio');
    view.rerender(<RouteScrollController />);
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith(0, 0);

    window.history.replaceState({}, '', '/en/production/portfolio?limit=15');
    view.rerender(<RouteScrollController />);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('does not reset scroll on Back or Forward navigation', () => {
    const view = render(<RouteScrollController />);

    mockedUsePathname.mockReturnValue('/en/production/portfolio');
    view.rerender(<RouteScrollController />);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    window.history.replaceState({}, '', '/en/production/about');
    window.dispatchEvent(new PopStateEvent('popstate'));
    mockedUsePathname.mockReturnValue('/en/production/about');
    view.rerender(<RouteScrollController />);

    window.history.replaceState({}, '', '/en/production/portfolio');
    window.dispatchEvent(new PopStateEvent('popstate'));
    mockedUsePathname.mockReturnValue('/en/production/portfolio');
    view.rerender(<RouteScrollController />);

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('does not leave a history marker after query-only Back or Forward', () => {
    const view = render(<RouteScrollController />);

    window.history.replaceState({}, '', '/en/production/about?tag=all');
    window.dispatchEvent(new PopStateEvent('popstate'));
    view.rerender(<RouteScrollController />);

    mockedUsePathname.mockReturnValue('/en/wedding');
    view.rerender(<RouteScrollController />);

    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith(0, 0);
  });

  it('handles programmatic mode and language pathname changes', () => {
    const view = render(<RouteScrollController />);

    mockedUsePathname.mockReturnValue('/en/wedding');
    view.rerender(<RouteScrollController />);
    mockedUsePathname.mockReturnValue('/th/wedding');
    view.rerender(<RouteScrollController />);

    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(window.scrollTo).toHaveBeenNthCalledWith(1, 0, 0);
    expect(window.scrollTo).toHaveBeenNthCalledWith(2, 0, 0);
  });
});
