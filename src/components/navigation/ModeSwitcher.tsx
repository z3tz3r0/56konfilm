'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useTransition } from 'react';

import { useMode } from '@/hooks/useMode';
import { type SiteMode } from '@/lib/preferences';
import { cn } from '@/lib/utils';

type ModeSlugMap = Record<SiteMode, string | null>;

interface ModeSwitcherProps {
  initialMode: SiteMode;
  homeSlugs: ModeSlugMap;
  className?: string;
}

export const ModeSwitcher = ({
  initialMode,
  homeSlugs,
  className,
}: ModeSwitcherProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Use the global store hook instead of local state
  const { mode: displayMode, setMode: setGlobalMode } = useMode();

  // Keep in sync when the server-provided initialMode changes after navigation
  useEffect(() => {
    // ⚠️ CRITICAL: Only update displayMode via store. Do NOT call logic with side-effects here
    // as it will disrupt the smooth slide animation.
    // However, since useMode handles side effects, we just ensure store is in sync
    // if parent passes a new initialMode that differs from store.
    if (initialMode) {
      // Intentionally NOT calling setMode here to avoid recursive side-effects/rendering loops
      // relying on ModeProvider to set the initial state is safer.
      // This effect is kept for reference to existing logic pattern but might be redundant
      // if ModeProvider works correctly.
    }
  }, [initialMode]);

  // Defer navigation until after the slide animation completes
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleModeChange = (nextMode: SiteMode) => {
    if (nextMode === displayMode) return;
    if (isPending) return;
    if (navTimerRef.current) return; // ignore double-taps while a nav is scheduled

    // Update Global State (Zustand + Cookie + Theme + Attribute)
    setGlobalMode(nextMode);

    const targetSlug = homeSlugs[nextMode];
    const targetPath = targetSlug ? `/${targetSlug}` : '/';

    navTimerRef.current = setTimeout(() => {
      navTimerRef.current = null;
      startTransition(() => {
        router.push(targetPath);
      });
    }, 0);
  };

  return (
    <motion.div
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
      <motion.span
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
      <motion.button
        onClick={() => handleModeChange('production')}
        disabled={isPending || !!navTimerRef.current}
        className={cn(
          'relative z-10 h-full cursor-pointer text-xs font-semibold tracking-[0.1em] uppercase',
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
      </motion.button>

      {/* Wedding button */}
      <motion.button
        onClick={() => handleModeChange('wedding')}
        disabled={isPending || !!navTimerRef.current}
        className={cn(
          'relative z-10 h-full cursor-pointer text-xs font-semibold tracking-[0.1em] uppercase',
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
      </motion.button>
    </motion.div>
  );
};
