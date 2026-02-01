'use client';

import { useModeStore } from '@/hooks/useMode';
import { SiteMode } from '@/lib/preferences';
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
  // Hydrate store with server state using useEffect to avoid render-phase updates
  useEffect(() => {
    useModeStore.setState({ mode: initialMode });
  }, [initialMode]);

  return <>{children}</>;
};
