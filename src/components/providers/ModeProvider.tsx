'use client';

import { useModeStore } from '@/hooks/useMode';
import { type SiteMode } from '@/lib/preferences';
import { type ReactNode, useEffect } from 'react';

interface ModeProviderProps {
  children: ReactNode;
  initialMode: SiteMode;
}

export const ModeProvider = ({ children, initialMode }: ModeProviderProps) => {
  useEffect(() => {
    useModeStore.setState({ mode: initialMode });
  }, [initialMode]);

  return <>{children}</>;
};
