import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LanguageSwitcher from '@shared/components/common/LanguageSwitcher';

const navigation = vi.hoisted(() => ({ pathname: '', push: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
}));
vi.mock('@shared/config', async () => ({
  ...(await import('@shared/config/preferences')),
  env: {},
}));

beforeEach(() => {
  navigation.push.mockClear();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.stubGlobal('PointerEvent', MouseEvent);
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('LanguageSwitcher comparison URLs', () => {
  it.each(['production', 'wedding'] as const)(
    'keeps the latest group queries and hash when changing locale in %s',
    async (mode) => {
      navigation.pathname = `/en/${mode}/packages`;
      window.history.replaceState({}, '', navigation.pathname);
      render(<LanguageSwitcher lang='en' mode={mode} />);
      // A comparison selection uses native replaceState after the switcher mounts.
      window.history.replaceState(
        {},
        '',
        `${navigation.pathname}?campaign=a&package-group-first=budget-friendly&package-group-second=luxury#pricing`
      );
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
      fireEvent.click(await screen.findByRole('option', { name: 'TH' }));
      expect(navigation.push).toHaveBeenCalledWith(
        `/th/${mode}/packages?campaign=a&package-group-first=budget-friendly&package-group-second=luxury#pricing`
      );
    }
  );
});
