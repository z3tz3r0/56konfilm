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
 * - Prevents hydration mismatch by syncing initial state
 */
export const ModeProvider = ({ children, initialMode }: ModeProviderProps) => {
  // Always update the store with the server-supplied mode on mount/change
  // This ensures the client store matches what the server rendered
  useEffect(() => {
    useModeStore.setState({ mode: initialMode });
  }, [initialMode]);

  return <>{children}</>;
};