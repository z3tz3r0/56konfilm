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

  const { 
    mode: displayMode, 
    setMode: setGlobalMode, 
    setIsTransitioning, 
    setTargetMode,
    isTransitioning,
    isCovered,
    setIsCovered,
    targetMode
  } = useMode();

  // Keep in sync when the server-provided initialMode changes after navigation
  useEffect(() => {
    // ⚠️ CRITICAL: Only update displayMode via store. Do NOT call logic with side-effects here
    // as it will disrupt the smooth slide animation.
    if (initialMode) {
      // Intentionally empty to preserve structure and verify no side-effects are added here.
      // ModeProvider handles the initial hydration.
    }
  }, [initialMode]);

  // Coordination Effect: When Curtain Covers Screen (isCovered=true)
  // Track if a transition has been initiated to prevent premature lifting or loops
  const hasStartedTransition = useRef(false);
  const targetPathRef = useRef<string | null>(null);

  // 1. Trigger Navigation when Covered
  useEffect(() => {
    if (isCovered && targetMode && !hasStartedTransition.current) {
      // Opt-in to optimistic update for global theme state
      setGlobalMode(targetMode);
      
      const targetSlug = homeSlugs[targetMode as SiteMode];
      const targetPath = targetSlug ? `/${lang}/${targetSlug}` : `/${lang}`;
      targetPathRef.current = targetPath;
      hasStartedTransition.current = true;

      if (targetPath !== pathname) {
        startTransition(() => {
          router.push(targetPath);
        });
      }
    }
  }, [isCovered, targetMode, setGlobalMode, startTransition, router, homeSlugs, pathname]);

  // 2. Lift Curtain when Navigation Complete (isPending -> false)
  useEffect(() => {
    const targetPath = targetPathRef.current;
    const navigationSettled = !targetPath || pathname === targetPath;

    if (isCovered && hasStartedTransition.current && navigationSettled && !isPending) {
        // Navigation (Transition) is done.
        // Lift the curtain.
        setIsTransitioning(false);
        setTargetMode(null);
        setIsCovered(false);
        hasStartedTransition.current = false;
        targetPathRef.current = null;
    }
  }, [isCovered, isPending, pathname, setIsTransitioning, setTargetMode, setIsCovered]);

  const handleModeChange = (nextMode: SiteMode) => {
    if (nextMode === displayMode) return;
    if (isPending || isTransitioning) return;
    
    // 1. Start Transition: Curtain enters
    setIsCovered(false);
    hasStartedTransition.current = false;
    targetPathRef.current = null;
    setTargetMode(nextMode);
    setIsTransitioning(true);
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
        disabled={isPending || isTransitioning}
        className={cn(
          'relative z-10 h-full cursor-pointer text-xs font-semibold tracking-[0.1em] uppercase',
          (isPending || isTransitioning) && 'cursor-not-allowed opacity-60'
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
        disabled={isPending || isTransitioning}
        className={cn(
          'relative z-10 h-full cursor-pointer text-xs font-semibold tracking-[0.1em] uppercase',
          (isPending || isTransitioning) && 'cursor-not-allowed opacity-60'
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
