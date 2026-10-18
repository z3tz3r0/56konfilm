import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PackageComparisonSection from '@features/package-comparison-section/PackageComparisonSection';
import type { Locale, SiteMode } from '@shared/config/preferences';
import { MotionProvider } from '@shared/providers/MotionProvider';
import { useSyncExternalStore } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { comparisonFixture } from './packageComparison.fixtures';

const device = vi.hoisted(() => ({
  allowHeavyMotion: false,
  isInitialized: true,
  prefersReducedMotion: false,
}));
// Geometry is mocked below; browser checks exercise the real CSS separately.
vi.mock(
  '@features/package-comparison-section/packageComparison.module.css',
  () => ({
    default: {
      section: 'comparison-section',
      content: 'comparison-content',
      tableLane: 'comparison-table-lane',
      tableFrame: 'comparison-table-frame',
      tableTrack: 'comparison-table-track',
      comparisonTable: 'comparison-table-grid',
      rowGroup: 'comparison-row-group',
      gridRow: 'comparison-grid-row',
      headerRow: 'comparison-header-row',
      packageHead: 'comparison-package-head',
      cornerHead: 'comparison-corner-head',
      scrollport: 'comparison-scrollport',
      measurement: 'comparison-measurement',
    },
  })
);
vi.mock('next/navigation', () => ({
  useSearchParams: () => {
    const search = useSyncExternalStore(
      (listener) => {
        window.addEventListener('popstate', listener);
        return () => window.removeEventListener('popstate', listener);
      },
      () => window.location.search,
      () => ''
    );
    return new URLSearchParams(search);
  },
  usePathname: () => window.location.pathname,
}));
const sizing = {
  desktop: true,
  available: 900,
  tabs: 420,
  observers: new Set<() => void>(),
  mediaListeners: new Set<() => void>(),
};

/** Runs mocked resize observers inside act to update the group controls presentation. */
function measureControls() {
  act(() => sizing.observers.forEach((measure) => measure()));
}

/** Replaces the fixture URL and dispatches popstate inside act to notify URL readers. */
function visitUrl(url: string) {
  act(() => {
    window.history.replaceState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}
const originalScrollIntoView = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'scrollIntoView'
);
vi.mock('@shared/hooks', () => ({
  useDeviceTier: () => device,
  useMode: () => ({ mode: 'wedding' }),
}));
vi.mock('@shared/config', async () => ({
  ...(await import('@shared/config/preferences')),
  env: {},
}));

/** Renders the localized comparison fixture with its motion provider for the requested site mode. */
function renderComparison(lang: Locale = 'en', mode: SiteMode = 'wedding') {
  return render(
    <MotionProvider>
      <PackageComparisonSection
        block={comparisonFixture(lang)}
        lang={lang}
        mode={mode}
      />
    </MotionProvider>
  );
}

beforeEach(() => {
  device.allowHeavyMotion = false;
  device.prefersReducedMotion = false;
  sizing.desktop = true;
  sizing.available = 900;
  sizing.tabs = 420;
  sizing.observers.clear();
  sizing.mediaListeners.clear();
  window.history.replaceState({}, '', '/en/wedding/packages');
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      return {
        width: this.getAttribute('data-slot') === 'tabs-list' ? sizing.tabs : 0,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };
    }
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.getAttribute('data-testid') === 'comparison-group-controls'
        ? sizing.available
        : 0;
    }
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        sizing.observers.add(callback);
        this.callback = callback;
      }
      callback: () => void;
      observe() {}
      unobserve() {}
      disconnect() {
        sizing.observers.delete(this.callback);
      }
    }
  );
  vi.stubGlobal('PointerEvent', MouseEvent);
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query === '(min-width: 48rem)' && sizing.desktop;
    },
    addEventListener(_: string, listener: () => void) {
      sizing.mediaListeners.add(listener);
    },
    removeEventListener(_: string, listener: () => void) {
      sizing.mediaListeners.delete(listener);
    },
  }));
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScrollIntoView)
    Object.defineProperty(
      HTMLElement.prototype,
      'scrollIntoView',
      originalScrollIntoView
    );
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
});

describe('CMS-driven Package Comparison', () => {
  it('uses three shared header rows for every package when any package has a badge', () => {
    renderComparison();
    expect(
      screen
        .getByRole('table')
        .style.getPropertyValue('--comparison-header-rows')
    ).toBe('3');
    const headers = screen.getAllByTestId('comparison-package-header');
    expect(headers).toHaveLength(2);
    expect(
      headers.every((header) => header.classList.contains('row-span-3'))
    ).toBe(true);
    expect(screen.getAllByText('MOST POPULAR')).toHaveLength(1);
  });

  it('uses two shared header rows when the entire group has no badge, including blank labels', () => {
    const block = comparisonFixture();
    block.groups![0].packages.forEach((item) => {
      item.badgeLabel = ' ';
    });
    render(
      <MotionProvider>
        <PackageComparisonSection block={block} lang='en' mode='wedding' />
      </MotionProvider>
    );
    expect(
      screen
        .getByRole('table')
        .style.getPropertyValue('--comparison-header-rows')
    ).toBe('2');
    expect(
      screen
        .getAllByTestId('comparison-package-header')
        .every((header) => header.classList.contains('row-span-2'))
    ).toBe(true);
    expect(screen.queryByText('MOST POPULAR')).not.toBeInTheDocument();
  });

  it('updates the shared header rows when the group changes without changing header associations', () => {
    renderComparison();
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Luxury' }), {
      button: 0,
    });
    expect(
      screen
        .getByRole('table')
        .style.getPropertyValue('--comparison-header-rows')
    ).toBe('2');
    expect(screen.getByTestId('comparison-package-header')).toHaveClass(
      'row-span-2'
    );
    const header = screen.getAllByRole('columnheader')[1];
    expect(screen.getByRole('cell')).toHaveAttribute(
      'headers',
      expect.stringContaining(header.id)
    );
  });

  it.each([
    ['en', 'production'],
    ['th', 'production'],
    ['en', 'wedding'],
    ['th', 'wedding'],
  ] as const)(
    'renders %s/%s headings, availability, badge, prices, and existing CTA variants',
    (lang, mode) => {
      renderComparison(lang, mode);
      const th = lang === 'th';
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        th ? 'เลือกแพ็กเกจของคุณ' : 'Find your perfect fit'
      );
      const table = screen.getByRole('table');
      expect(within(table).getAllByRole('columnheader')).toHaveLength(3);
      expect(within(table).getAllByRole('columnheader')[0]).toHaveTextContent(
        th ? 'เปรียบเทียบแพ็กเกจ' : 'Package comparison'
      );
      expect(
        within(table)
          .getAllByRole('rowheader')
          .map((item) => item.textContent)
      ).toEqual([th ? 'ภาพถ่าย' : 'Photography', th ? 'วิดีโอ' : 'Film']);
      expect(
        within(table)
          .getAllByRole('cell')
          .map((cell) => cell.textContent)
      ).toEqual([
        th ? 'รวมในแพ็กเกจ' : 'Included',
        th ? 'รวมในแพ็กเกจ' : 'Included',
        `-${th ? 'ไม่รวมในแพ็กเกจ' : 'Not included'}`,
        th ? 'รวมในแพ็กเกจ' : 'Included',
      ]);
      expect(screen.getByText('0 THB')).toBeInTheDocument();
      expect(screen.getByText('2,000 THB')).toBeInTheDocument();
      expect(
        screen.getByText(th ? 'ยอดนิยมที่สุด' : 'MOST POPULAR')
      ).toBeInTheDocument();
      const links = within(table).getAllByRole('link');
      expect(links.map((link) => link.getAttribute('href'))).toEqual([
        `/${lang}/${mode}/contact`,
        `/${lang}/${mode}/contact`,
      ]);
      expect(links[0].querySelector('button')).toHaveAttribute(
        'data-variant',
        'secondary'
      );
      expect(links[1].querySelector('button')).toHaveAttribute(
        'data-variant',
        'default'
      );
      expect(links[0]).not.toHaveClass('w-full');
      const cells = within(table).getAllByRole('cell');
      expect(cells[2]).toHaveAttribute(
        'headers',
        expect.stringContaining('package-basic')
      );
      expect(cells[2]).toHaveAttribute(
        'headers',
        expect.stringContaining('service-film')
      );
      expect(
        screen.getAllByRole('button', {
          name: /More information about|รายละเอียดเพิ่มเติมเกี่ยวกับ/,
        })
      ).toHaveLength(1);
    }
  );

  it('switches desktop tabs, resets only horizontal scroll, and synchronizes the select', () => {
    const { container } = renderComparison();
    const scrollport = container.querySelector<HTMLElement>(
      '[data-testid=comparison-scrollport]'
    )!;
    scrollport.scrollLeft = 180;
    const scrollTo = vi.spyOn(window, 'scrollTo');
    const tab = screen.getByRole('tab', { name: 'Luxury' });
    fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(window.location.search).toBe('?package-group-comparison=luxury');
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.queryByText('Essential')).not.toBeInTheDocument();
    expect(scrollport.scrollLeft).toBe(0);
    expect(scrollTo).not.toHaveBeenCalled();
    const link = within(screen.getByRole('table')).getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com/inquire');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('changes groups through the mobile select and retains the selected group after media changes', async () => {
    sizing.desktop = false;
    renderComparison();
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const option = await screen.findByRole('option', { name: 'Luxury' });
    fireEvent.click(option);
    expect(screen.getByRole('table')).toHaveAccessibleName(
      'Find your perfect fit — Luxury'
    );
    sizing.desktop = true;
    measureControls();
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Luxury' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    );
    fireEvent(window, new Event('resize'));
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(window.location.search).toBe('?package-group-comparison=luxury');
  });

  it('supports keyboard navigation between desktop tabs', async () => {
    renderComparison();
    const first = screen.getByRole('tab', { name: 'Budget friendly' });
    await act(async () => {
      first.focus();
      fireEvent.keyDown(first, { key: 'ArrowRight' });
    });
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Luxury' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    );
  });

  it('shows CMS information as a tap popover with localized trigger text and no raw HTML', async () => {
    const block = comparisonFixture('th');
    block.groups![0].rows[0].information =
      'รายละเอียด\n<script>not executable</script>';
    render(
      <MotionProvider>
        <PackageComparisonSection block={block} lang='th' mode='wedding' />
      </MotionProvider>
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'รายละเอียดเพิ่มเติมเกี่ยวกับ ภาพถ่าย',
      })
    );
    const popup = await screen.findByRole('dialog');
    expect(popup.textContent).toBe(
      'รายละเอียด\n<script>not executable</script>'
    );
    expect(popup.querySelector('script')).toBeNull();
    fireEvent.keyDown(popup, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders one group and omits unavailable optional content without supplying business text', () => {
    const block = comparisonFixture();
    block.groups = [block.groups![1]];
    block.groups[0].packages[0] = {
      _id: 'minimal',
      title: 'Only package',
      serviceIds: [],
    };
    block.groups[0].rows[0].information = ' ';
    render(
      <MotionProvider>
        <PackageComparisonSection block={block} lang='en' mode='production' />
      </MotionProvider>
    );
    expect(screen.getAllByRole('tab')).toHaveLength(1);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /More information/ })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('cell')).toHaveTextContent('-Not included');
    expect(screen.queryByText(/THB/)).not.toBeInTheDocument();
  });

  it('omits empty and incomplete groups without rendering a blank navigation or table', () => {
    const block = comparisonFixture();
    block.groups = [{ ...block.groups![0], packages: [] }];
    const { container } = render(
      <PackageComparisonSection block={block} lang='en' mode='wedding' />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('prerenders the first table and Select without an accessible measuring TabsList', () => {
    const markup = renderToString(
      <MotionProvider>
        <PackageComparisonSection
          block={comparisonFixture()}
          lang='en'
          mode='wedding'
        />
      </MotionProvider>
    );
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('<table');
    expect(markup).toContain('Package comparison');
    expect(markup).toContain('aria-hidden="true" inert=""');
  });

  it('hydrates the prerendered first group before selecting the shared URL without a mismatch', async () => {
    visitUrl('/en/wedding/packages?package-group-comparison=luxury');
    const tree = (
      <MotionProvider>
        <PackageComparisonSection
          block={comparisonFixture()}
          lang='en'
          mode='wedding'
        />
      </MotionProvider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    expect(container.textContent).toContain('Essential');
    document.body.append(container);
    const recover = vi.fn();
    const replace = vi.spyOn(window.history, 'replaceState');
    const root = hydrateRoot(container, tree, { onRecoverableError: recover });
    try {
      await waitFor(() =>
        expect(within(container).getByText('Complete')).toBeInTheDocument()
      );
      expect(recover).not.toHaveBeenCalled();
      expect(replace).not.toHaveBeenCalled();
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  });

  it('uses one measuring TabsList, switches on fit, preserves scroll, and moves only control focus', () => {
    const { container } = renderComparison();
    const scrollport = screen.getByTestId('comparison-scrollport');
    scrollport.scrollLeft = 170;
    const current = screen.getByRole('tab', { name: 'Budget friendly' });
    act(() => current.focus());
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    sizing.available = 400;
    measureControls();
    const select = screen.getByRole('combobox');
    expect(select).toHaveFocus();
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByTestId('comparison-tabs-presentation')).toHaveAttribute(
      'inert'
    );
    expect(container.querySelectorAll('[role=tablist]')).toHaveLength(1);
    expect(scrollport.scrollLeft).toBe(170);
    sizing.available = 1000;
    measureControls();
    expect(screen.getByRole('tab', { name: 'Budget friendly' })).toHaveFocus();
    expect(
      screen.getByTestId('comparison-tabs-presentation')
    ).not.toHaveAttribute('inert');
    expect(scrollport.scrollLeft).toBe(170);
    act(() => scrollport.focus());
    sizing.desktop = false;
    act(() => sizing.mediaListeners.forEach((listener) => listener()));
    expect(scrollport).toHaveFocus();
    expect(scrollport.scrollLeft).toBe(170);
  });

  it('hydrates from a slug and resolves unknown or removed values without changing the URL', () => {
    visitUrl(
      '/en/wedding/packages?package-group-comparison=luxury&campaign=a#pricing'
    );
    const replace = vi.spyOn(window.history, 'replaceState');
    renderComparison();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    const scrollport = screen.getByTestId('comparison-scrollport');
    scrollport.scrollLeft = 180;
    visitUrl(
      '/en/wedding/packages?package-group-comparison=renamed&campaign=a#pricing'
    );
    expect(screen.getByText('Essential')).toBeInTheDocument();
    expect(scrollport.scrollLeft).toBe(0);
    expect(window.location.search).toContain(
      'package-group-comparison=renamed'
    );
    visitUrl('/en/wedding/packages?package-group-comparison=luxury#pricing');
    expect(screen.getByText('Complete')).toBeInTheDocument();
    visitUrl('/en/wedding/packages#pricing');
    expect(screen.getByText('Essential')).toBeInTheDocument();
  });

  it('updates one parameter without adding history or losing other queries, hash, or history state', () => {
    window.history.replaceState(
      { preserved: true },
      '',
      '/en/wedding/packages?campaign=a&package-group-other=other#pricing'
    );
    renderComparison();
    const historyLength = window.history.length;
    const replace = vi.spyOn(window.history, 'replaceState');
    const push = vi.spyOn(window.history, 'pushState');
    const scroll = vi.spyOn(window, 'scrollTo');
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Luxury' }), {
      button: 0,
    });
    expect(
      new URLSearchParams(window.location.search).get(
        'package-group-comparison'
      )
    ).toBe('luxury');
    expect(
      new URLSearchParams(window.location.search).get('package-group-other')
    ).toBe('other');
    expect(new URLSearchParams(window.location.search).get('campaign')).toBe(
      'a'
    );
    expect(window.location.hash).toBe('#pricing');
    expect(window.history.state).toEqual({ preserved: true });
    expect(window.history.length).toBe(historyLength);
    expect(replace).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
    expect(scroll).not.toHaveBeenCalled();
    // Model Next's native history integration publishing the updated search params.
    act(() => window.dispatchEvent(new PopStateEvent('popstate')));
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('keeps sections independent and retains a slugless group after its own parameter is cleared', () => {
    const first = comparisonFixture();
    delete first.groups![1].slug;
    const second = { ...comparisonFixture(), _key: 'another' };
    visitUrl(
      '/en/wedding/packages?package-group-comparison=budget-friendly&package-group-another=luxury#pricing'
    );
    render(
      <MotionProvider>
        <PackageComparisonSection block={first} lang='en' mode='wedding' />
        <PackageComparisonSection block={second} lang='en' mode='wedding' />
      </MotionProvider>
    );
    const sections = screen.getAllByTestId('package-comparison-section');
    fireEvent.mouseDown(
      within(sections[0]).getByRole('tab', { name: 'Luxury' }),
      { button: 0 }
    );
    act(() => window.dispatchEvent(new PopStateEvent('popstate')));
    expect(within(sections[0]).getByText('Complete')).toBeInTheDocument();
    expect(within(sections[1]).getByText('Complete')).toBeInTheDocument();
    expect(
      new URLSearchParams(window.location.search).has(
        'package-group-comparison'
      )
    ).toBe(false);
    expect(
      new URLSearchParams(window.location.search).get('package-group-another')
    ).toBe('luxury');
    expect(window.location.hash).toBe('#pricing');
  });

  it('writes a kebab-case parameter and removes only its own previous parameter', () => {
    visitUrl(
      '/en/wedding/packages?packageGroup_comparison=luxury&package-group-another=budget-friendly&campaign=a#pricing'
    );
    const replace = vi.spyOn(window.history, 'replaceState');
    renderComparison();
    // The reader uses the new parameter only and preserves the URL on load.
    expect(screen.getByText('Essential')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Luxury' }), {
      button: 0,
    });
    const params = new URLSearchParams(window.location.search);
    expect(params.get('package-group-comparison')).toBe('luxury');
    expect(params.has('packageGroup_comparison')).toBe(false);
    expect(params.get('package-group-another')).toBe('budget-friendly');
    expect(params.get('campaign')).toBe('a');
    expect(window.location.hash).toBe('#pricing');
    act(() => window.dispatchEvent(new PopStateEvent('popstate')));
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('reads the new name when both are present and clears both own names for a slugless selection', () => {
    const block = comparisonFixture();
    delete block.groups![0].slug;
    visitUrl(
      '/en/wedding/packages?package-group-comparison=luxury&packageGroup_comparison=budget-friendly&package-group-another=luxury#pricing'
    );
    render(
      <MotionProvider>
        <PackageComparisonSection block={block} lang='en' mode='wedding' />
      </MotionProvider>
    );
    expect(screen.getByText('Complete')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Budget friendly' }), {
      button: 0,
    });
    act(() => window.dispatchEvent(new PopStateEvent('popstate')));
    const params = new URLSearchParams(window.location.search);
    expect(params.has('package-group-comparison')).toBe(false);
    expect(params.has('packageGroup_comparison')).toBe(false);
    expect(params.get('package-group-another')).toBe('luxury');
    expect(screen.getByText('Essential')).toBeInTheDocument();
    expect(window.location.hash).toBe('#pricing');
  });

  it('remeasures after fonts and localized text change without resetting the selected table scroll', async () => {
    const fontListeners = new Set<() => void>();
    let resolveFonts!: () => void;
    const ready = new Promise<void>((resolve) => {
      resolveFonts = resolve;
    });
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        ready,
        addEventListener: (_: string, callback: () => void) =>
          fontListeners.add(callback),
        removeEventListener: (_: string, callback: () => void) =>
          fontListeners.delete(callback),
      },
    });
    const { rerender, unmount } = renderComparison();
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Luxury' }), {
      button: 0,
    });
    const scrollport = screen.getByTestId('comparison-scrollport');
    scrollport.scrollLeft = 140;
    sizing.tabs = 1200;
    await act(async () => {
      resolveFonts();
      await ready;
    });
    expect(screen.getByRole('combobox')).toHaveTextContent('Luxury');
    expect(scrollport.scrollLeft).toBe(140);
    sizing.tabs = 500;
    act(() => fontListeners.forEach((callback) => callback()));
    expect(screen.getByRole('tab', { name: 'Luxury' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    rerender(
      <MotionProvider>
        <PackageComparisonSection
          block={comparisonFixture('th')}
          lang='th'
          mode='wedding'
        />
      </MotionProvider>
    );
    expect(screen.getByRole('tab', { name: 'พรีเมียม' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(scrollport.scrollLeft).toBe(140);
    unmount();
    expect(fontListeners.size).toBe(0);
    Reflect.deleteProperty(document, 'fonts');
  });
});
