import { SiteMode } from '@/lib/preferences';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';
import { create } from 'zustand';

interface ModeState {
  mode: SiteMode;
  setMode: (mode: SiteMode) => void;
}

export const useModeStore = create<ModeState>((set) => ({
  mode: 'production',
  setMode: (mode) => set({ mode }),
}));

const MODE_TO_THEME: Record<SiteMode, 'dark' | 'light'> = {
  production: 'dark',
  wedding: 'light',
};

export const useMode = () => {
  const { mode, setMode } = useModeStore();
  const { setTheme } = useTheme();

  const handleSetMode = useCallback((newMode: SiteMode) => {
    setMode(newMode);
    setTheme(MODE_TO_THEME[newMode]);
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    document.cookie = `mode=${newMode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secureFlag}`;
    document.documentElement.setAttribute('data-mode', newMode);
  }, [setMode, setTheme]);

  const handleToggleMode = useCallback(() => {
    const nextMode = mode === 'production' ? 'wedding' : 'production';
    handleSetMode(nextMode);
  }, [mode, handleSetMode]);

  return {
    mode,
    setMode: handleSetMode,
    toggleMode: handleToggleMode,
  };
};