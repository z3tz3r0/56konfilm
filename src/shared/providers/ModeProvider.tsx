'use client';

import { useModeStore } from '@shared/stores';
import { type SiteMode } from '@shared/config';
import { type ReactNode, useEffect } from 'react';

interface ModeProviderProps {
  children: ReactNode;
  initialMode: SiteMode;
}

export function ModeProvider({ children, initialMode }: ModeProviderProps) {
  useEffect(() => {
    useModeStore.setState({ mode: initialMode });
  }, [initialMode]);

  return <>{children}</>;
}
