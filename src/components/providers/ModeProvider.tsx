'use client';

import { useModeStore } from '@/hooks/useMode';
import { SiteMode } from '@/lib/preferences';
import { ReactNode, useRef } from 'react';

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
  // Use a safe initialization pattern to avoid "Cannot update a component while rendering a different component"
  // We initialize the store state directly if it hasn't been set yet to match server state
  // This is safe because useModeStore is external to the component tree
  const initialized = useRef(false);
  
  if (!initialized.current) {
    useModeStore.setState({ mode: initialMode });
    initialized.current = true;
  }

  return <>{children}</>;
};
