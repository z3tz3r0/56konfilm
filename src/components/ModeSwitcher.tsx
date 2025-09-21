'use client';

import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

type ModeValue = 'production' | 'wedding';

interface ModeSwitcherProps {
  initialMode: ModeValue;
}

export const ModeSwitcher = ({ initialMode }: ModeSwitcherProps) => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const desiredTheme = initialMode === 'production' ? 'dark' : 'light';
    setTheme(desiredTheme);
  }, [initialMode, setTheme]);

  const currentValue = useMemo(() => {
    return resolvedTheme === 'dark' ? 'production' : 'wedding';
  }, [resolvedTheme]);

  const handleChange = (next: string) => {
    const nextMode = next === 'production' ? 'dark' : 'light';
    setTheme(nextMode);
    document.cookie = `mode=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.refresh();
  };

  return (
    <Tabs value={currentValue} onValueChange={handleChange}>
      <TabsList>
        <TabsTrigger value="production">Production</TabsTrigger>
        <TabsTrigger value="wedding">Wedding</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
