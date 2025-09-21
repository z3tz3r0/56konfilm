'use client';

import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { setModeCookie } from '@/actions/setModeCookie';
import { isSupportedMode, type SiteMode } from '@/lib/preferences';
import { cn } from '@/lib/utils';

import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface ModeSwitcherProps {
  initialMode: SiteMode;
}

const MODE_TO_THEME: Record<SiteMode, 'dark' | 'light'> = {
  production: 'dark',
  wedding: 'light',
};

export const ModeSwitcher = ({ initialMode }: ModeSwitcherProps) => {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [mode, setMode] = useState<SiteMode>(initialMode);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isSupportedMode(initialMode)) {
      setMode(initialMode);
      setTheme(MODE_TO_THEME[initialMode]);
    }
  }, [initialMode, setTheme]);

  const handleModeChange = (value: string) => {
    if (!isSupportedMode(value) || value === mode || isPending) {
      return;
    }

    const nextMode = value as SiteMode;

    setMode(nextMode);
    setTheme(MODE_TO_THEME[nextMode]);

    startTransition(async () => {
      try {
        await setModeCookie(nextMode);
        router.refresh();
      } catch (error) {
        console.error('Failed to update mode: ', error);
        setMode(mode);
        setTheme(MODE_TO_THEME[mode]);
      }
    });
  };
  return (
    <Tabs value={mode} onValueChange={handleModeChange}>
      <TabsList
        className={cn(
          'relative grid h-11 w-60 grid-cols-2 items-center rounded-md transition-all duration-300 ease-out',
          mode === 'production' ? 'bg-midnight-black' : 'bg-brown'
        )}
      >
        <span
          className={cn(
            'bg-ivory-white pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-0.5rem)] rounded-sm transition-[transform,background-color] duration-300 ease-out'
          )}
          style={{
            transform:
              mode === 'production'
                ? 'translateX(0%)'
                : 'translateX(calc(100% + 0.5rem))',
          }}
        />
        <TabsTrigger
          value="production"
          className={cn(
            'relative z-10 cursor-pointer text-xs font-semibold tracking-[0.25em] uppercase transition-colors duration-300 ease-out',
            mode === 'production' ? 'text-midnight-black' : 'text-off-white'
          )}
        >
          Production
        </TabsTrigger>
        <TabsTrigger
          value="wedding"
          className={cn(
            'relative z-10 cursor-pointer text-xs font-semibold tracking-[0.25em] uppercase transition-colors duration-300 ease-out',
            mode === 'wedding' ? 'text-brown' : 'text-ivory-white'
          )}
        >
          Wedding
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
