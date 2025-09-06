'use client';

import { SiteMode, useSiteMode } from '@/hooks/useSiteMode';
import { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

export const ModeSwitcher = () => {
  const { mode, setMode } = useSiteMode();

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'production') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  return (
    <Tabs value={mode} onValueChange={(value) => setMode(value as SiteMode)}>
      <TabsList>
        <TabsTrigger value="production">Production</TabsTrigger>
        <TabsTrigger value="wedding">Wedding</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
