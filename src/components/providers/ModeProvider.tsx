'use client';

import { useModeStore } from '@/hooks/useMode';
import { SiteMode } from '@/lib/preferences';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ModeProviderProps {
  children: ReactNode;
  initialMode: SiteMode;
}



/**
 * ModeProvider
 * - Hydrates the Zustand store with server-side implementation mode (from cookie)
 * - Prevents hydration mismatch by syncing initial state immediately via useRef guard
 */
export const ModeProvider = ({ children, initialMode }: ModeProviderProps) => {
  const { setTheme } = useTheme();

  // 1. Synchronous hydration of Zustand store (render-phase)
  // Prevents "flicker" where store is empty for one frame
  const initialized = useRef(false);
  if (!initialized.current) {
    useModeStore.setState({ mode: initialMode });
    initialized.current = true;
  }

  // 2. Sync side-effects (Theme & DOM) when initialMode changes (after navigation completes)
  useEffect(() => {
    // Sync theme with server mode to ensure next-themes (css vars) matches cookie (content)
    const targetTheme = initialMode === 'production' ? 'dark' : 'light';
    setTheme(targetTheme);
    
    // Ensure data-mode attribute is in sync (critical for CSS selectors)
    document.documentElement.setAttribute('data-mode', initialMode);
  }, [initialMode, setTheme]);

  const pathname = usePathname();
  const pendingPath = useModeStore((state) => state.pendingPath);

  useEffect(() => {
    if (!pendingPath) return;
    if (pathname === pendingPath) {
      useModeStore.setState({
        isTransitioning: false,
        pendingPath: null,
        targetMode: null,
      });
    }
  }, [pathname, pendingPath]);

  return <>{children}</>;
};
