import { SiteMode } from '@/lib/preferences';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { create } from 'zustand';

/**
 * Interface definition for Mode State
 * Cleaned: Removed global transition/curtain states
 */
interface ModeState {
  mode: SiteMode;
  setMode: (mode: SiteMode) => void;
}

/**
 * useModeStore: Zustand store for client-side mode state
 */
export const useModeStore = create<ModeState>((set) => ({
  mode: 'production', // Default fallback
  setMode: (mode) => set({ mode }),
}));


/**
 * useMode Hook
 * Encapsulates mode logic including side-effects (Cookie, Theme, Attribute)
 */
export const useMode = () => {
  const { mode, setMode } = useModeStore();
  const { setTheme } = useTheme();

  useEffect(() => {
    // Ensure first-load sets mode cookie when missing
    if (typeof document !== 'undefined' && !document.cookie.split('; ').find(row => row.startsWith('mode='))) {
      const defaultMode = 'production';
      const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
      document.cookie = `mode=${defaultMode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secureFlag}`;
    }
  }, []);

  const MODE_TO_THEME: Record<SiteMode, 'dark' | 'light'> = {
    production: 'dark',
    wedding: 'light',
  };

  const handleSetMode = (newMode: SiteMode) => {
    // 1. Update Zustand State
    setMode(newMode);

    // 2. Update next-themes
    setTheme(MODE_TO_THEME[newMode]);

    // 3. Update Cookie
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    document.cookie = `mode=${newMode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secureFlag}`;

    // 4. Update HTML Attribute
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