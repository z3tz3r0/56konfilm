'use client';

import { m } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useTransition } from 'react';

import { useMode } from '@/hooks/useMode';
import { type SiteMode } from '@/lib/preferences';
import { cn } from '@/lib/utils';

type ModeSlugMap = Record<SiteMode, string | null>;

interface ModeSwitcherProps {
  homeSlugs: ModeSlugMap;
  className?: string;
  lang: 'en' | 'th';
}

export const ModeSwitcher = ({
  homeSlugs,
  className,
  lang,
}: ModeSwitcherProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Use the global store hook instead of local state
  const { mode: displayMode, setMode: setGlobalMode } = useMode();

  // Defer navigation until after the slide animation completes
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleModeChange = (nextMode: SiteMode) => {
    if (nextMode === displayMode) return;
    if (isPending) return;
    if (navTimerRef.current) return; // ignore double-taps while a nav is scheduled

    // Update Global State (Zustand + Cookie + Theme + Attribute)
    setGlobalMode(nextMode);

    // Calculate target path including [lang]
    const targetSlug = homeSlugs[nextMode];
    const targetPath = targetSlug ? `/${lang}/${targetSlug}` : `/${lang}`;

    navTimerRef.current = setTimeout(() => {
      navTimerRef.current = null;
      startTransition(() => {
        if (targetPath !== pathname) {
          router.push(targetPath);
        } else {
          router.refresh();
        }
      });
    }, 0);
  };

  return (
    <m.div
      data-testid="mode-switcher"
      className={cn(
        'relative grid h-11 w-64 grid-cols-2 items-center rounded-md p-1',
        className
      )}
      animate={{
        backgroundColor:
          displayMode === 'production'
            ? '#00040d' // midnight-black
            : '#5b4339', // brown
      }}
      initial={false}
    >
      {/* Sliding indicator */}
      <m.span
        className={cn(
          'bg-ivory-white pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-0.5rem)] rounded-sm'
        )}
        animate={{
          x: displayMode === 'production' ? 0 : 'calc(100% + 0.5rem)',
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
        disabled={isPending || !!navTimerRef.current}
        className={cn(
          'font-primary relative z-10 h-full cursor-pointer text-xs tracking-[0.8px] uppercase',
          isPending && 'cursor-not-allowed opacity-60'
        )}
        animate={{
          color:
            displayMode === 'production'
              ? '#00040d' // midnight-black
              : '#f9f9f9', // off-white
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Production
      </m.button>

      {/* Wedding button */}
      <m.button
        onClick={() => handleModeChange('wedding')}
        disabled={isPending || !!navTimerRef.current}
        className={cn(
          'font-primary relative z-10 h-full cursor-pointer text-xs tracking-[0.8px] uppercase',
          isPending && 'cursor-not-allowed opacity-60'
        )}
        animate={{
          color: displayMode === 'wedding' ? '#5b4339' : '#faf7f2', // text-brown : text-ivory-white
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Wedding
      </m.button>
    </m.div>
  );
};
