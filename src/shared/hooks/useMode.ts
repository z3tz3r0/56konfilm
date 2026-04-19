import { env } from '@shared/config';
import { useModeStore } from '@shared/stores';
import { SiteMode } from '@shared/config';
import { useCallback } from 'react';

export function useMode() {
  const { mode, setMode } = useModeStore();

  const handleSetMode = useCallback(
    (newMode: SiteMode) => {
      setMode(newMode);
      const secureFlag = env.NODE_ENV === 'production' ? '; Secure' : '';
      document.cookie = `mode=${newMode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secureFlag}`;
    },
    [setMode]
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
