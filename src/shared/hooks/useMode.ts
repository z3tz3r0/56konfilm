import { env } from '@shared/config';
import { useModeStore } from '@shared/stores';
import { MODE_TO_THEME, SiteMode } from '@shared/config';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

export function useMode() {
  const { mode, setMode } = useModeStore();
  const { setTheme } = useTheme();

  const handleSetMode = useCallback(
    (newMode: SiteMode) => {
      setMode(newMode);
      setTheme(MODE_TO_THEME[newMode]);
      const secureFlag = env.NODE_ENV === 'production' ? '; Secure' : '';
      document.cookie = `mode=${newMode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secureFlag}`;
      document.documentElement.setAttribute('data-mode', newMode);
    },
    [setMode, setTheme]
  );

  const handleToggleMode = useCallback(() => {
    const nextMode = mode === 'production' ? 'wedding' : 'production';
    handleSetMode(nextMode);
  }, [mode, handleSetMode]);

  return {
    mode,
    setMode: handleSetMode,
    toggleMode: handleToggleMode,
  };
}
