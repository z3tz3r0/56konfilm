'use client';

import { motion } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useTransition } from 'react';

import { useMode } from '@/hooks/useMode';
import { type SiteMode } from '@/lib/preferences';
import { cn } from '@/lib/utils';

type ModeSlugMap = Record<SiteMode, string | null>;

interface ModeSwitcherProps {
  initialMode: SiteMode;
  homeSlugs: ModeSlugMap;
  className?: string;
  lang: 'en' | 'th';
}

export const ModeSwitcher = ({
  initialMode,
  homeSlugs,
  className,
  lang,
}: ModeSwitcherProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Use the global store hook
  const { mode: displayMode, setMode: setGlobalMode } = useMode();

  // Keep in sync when the server-provided initialMode changes after navigation
  useEffect(() => {
    // Relying on ModeProvider for store hydration
  }, [initialMode]);

  // Defer navigation until after the slide animation completes
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleModeChange = (nextMode: SiteMode) => {
    if (nextMode === displayMode) return;
    if (isPending) return;
    if (navTimerRef.current) return; // ignore double-taps while a nav is scheduled

    // 1. Update Global State (Zustand + Cookie + Theme + Attribute) IMMEDIATELY
    setGlobalMode(nextMode);

    // 2. Calculate target path based on mode
    const currentHomeSlug = homeSlugs[displayMode];
    const currentHomePath = currentHomeSlug ? `/${lang}/${currentHomeSlug}` : `/${lang}`;
    const isCurrentlyOnHome = pathname === currentHomePath;

    let targetPath: string;
    if (isCurrentlyOnHome) {
      // If on home, navigate to the target mode's home
      const targetSlug = homeSlugs[nextMode];
      targetPath = targetSlug ? `/${lang}/${targetSlug}` : `/${lang}`;
    } else {
      // If on a content page, stay on the same path
      targetPath = pathname;
    }

    // 3. Defer navigation slightly for animation smoothness
    navTimerRef.current = setTimeout(() => {
      navTimerRef.current = null;
      
      if (targetPath !== pathname) {
        startTransition(() => {
          router.push(targetPath);
        });
      } else {
        startTransition(() => {
          router.refresh();
        });
      }
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
            ? 'var(--color-midnight-black)'
            : 'var(--color-brown)',
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
          'relative z-10 h-full cursor-pointer text-xs font-semibold tracking-widest uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          isPending && 'cursor-not-allowed opacity-60'
        )}
        animate={{
          color:
            displayMode === 'production'
              ? 'var(--color-midnight-black)'
              : 'var(--color-off-white)',
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
          'relative z-10 h-full cursor-pointer text-xs font-semibold tracking-widest uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          isPending && 'cursor-not-allowed opacity-60'
        )}
        animate={{
          color: displayMode === 'wedding' ? 'var(--color-brown)' : 'var(--color-ivory-white)',
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
