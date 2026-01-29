import { SiteMode } from '@/lib/preferences';
import { useTheme } from 'next-themes';
import { create } from 'zustand';

/**
 * Interface definition for Mode State
 * Follows Story 1.1 requirements
 */
interface ModeState {
  mode: SiteMode;
  setMode: (mode: SiteMode) => void;
  toggleMode: () => void;
}

/**
 * useModeStore: Zustand store for client-side mode state
 * Note: This state is primarily for client-side reactivity.
 * Initial state synchronization happens in ModeProvider.
 */
export const useModeStore = create<ModeState>((set) => ({
  mode: 'production', // Default fallback, overridden by hydration
  setMode: (mode) => set({ mode }),
  toggleMode: () =>
    set((state) => ({
      mode: state.mode === 'production' ? 'wedding' : 'production',
    })),
}));

/**
 * useMode Hook
 * Encapsulates mode logic including side-effects (Cookie, Theme, Attribute)
 */
export const useMode = () => {
  const { mode, setMode, toggleMode } = useModeStore();
  const { setTheme } = useTheme();

  // Mapping constant from Story 1.1
  const MODE_TO_THEME: Record<SiteMode, 'dark' | 'light'> = {
    production: 'dark',
    wedding: 'light',
  };

  const handleSetMode = (newMode: SiteMode) => {
    // 1. Update Zustand State
    setMode(newMode);

    // 2. Update next-themes
    setTheme(MODE_TO_THEME[newMode]);

    // 3. Update Cookie (One year expiry as per requirements)
    document.cookie = `mode=${newMode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

    // 4. Update HTML Attribute (Architecture requirement)
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-mode', newMode);
    }
  };

  const handleToggleMode = () => {
    const nextMode = mode === 'production' ? 'wedding' : 'production';
    handleSetMode(nextMode);
  };

  return {
    mode,
    setMode: handleSetMode,
    toggleMode: handleToggleMode,
  };
};
