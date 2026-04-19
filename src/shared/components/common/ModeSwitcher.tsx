'use client';

import { m } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { useMode } from '@shared/hooks';
import { Locale, MODE_TO_THEME, type SiteMode } from '@shared/config';
import { cn } from '@shared/utils';
import { useTheme } from 'next-themes';

interface ModeSwitcherProps {
  className?: string;
  lang: Locale;
  mode: SiteMode;
}

export default function ModeSwitcher({
  className,
  lang,
  mode: serverMode,
}: ModeSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const { setTheme } = useTheme();

  // Use the global store hook instead of local state
  const { mode: storeMode, setMode: setGlobalMode } = useMode();
  const activeMode = storeMode || serverMode;

  useEffect(() => {
    setTheme(MODE_TO_THEME[serverMode]);
    document.documentElement.setAttribute('data-mode', serverMode);
    setGlobalMode(serverMode);
  }, [serverMode, setTheme, setGlobalMode]);

  const handleModeChange = (nextMode: SiteMode) => {
    if (nextMode === activeMode || isPending) return;

    // Update Global State (Zustand + Cookie + Theme + Attribute)
    setGlobalMode(nextMode);
    startTransition(async () => {
      const targetPath = `/${lang}/${nextMode}`;
      if (targetPath !== pathname) {
        await router.push(targetPath);
      } else {
        await router.refresh();
      }
    });
  };

  return (
    <div
      data-testid="mode-switcher"
      className={cn(
        'bg-primary dark:bg-background relative grid h-11 w-64 grid-cols-2 items-center rounded-md p-1',
        className
      )}
    >
      {/* Sliding indicator */}
      <m.span
        className={cn(
          'bg-ivory-white pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-0.5rem)] rounded-sm'
        )}
        animate={{
          x: activeMode === 'production' ? 0 : 'calc(100% + 0.5rem)',
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        initial={false}
      />

      {/* Production button */}
      <m.button
        onClick={() => handleModeChange('production')}
        disabled={isPending}
        className={cn(
          'relative z-10 h-full cursor-pointer text-xs tracking-[0.8px] uppercase',
          isPending && 'cursor-not-allowed opacity-60'
        )}
        animate={{
          color:
            activeMode === 'production'
              ? '#00040d' // midnight-black
              : '#f9f9f9', // off-white
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {lang === 'en' ? 'Production' : 'โปรดักชัน'}
      </m.button>

      {/* Wedding button */}
      <m.button
        onClick={() => handleModeChange('wedding')}
        disabled={isPending}
        className={cn(
          'relative z-10 h-full cursor-pointer text-xs tracking-[0.8px] uppercase',
          isPending && 'cursor-not-allowed opacity-60'
        )}
        animate={{
          color: activeMode === 'wedding' ? '#5b4339' : '#faf7f2', // text-brown : text-ivory-white
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {lang === 'en' ? 'Wedding' : 'งานแต่ง'}
      </m.button>
    </div>
  );
}
