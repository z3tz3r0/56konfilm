'use client';

import { motion } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';

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

  const { mode: displayMode, setMode: setGlobalMode } = useMode();

  // Sync global store with server-side truth when initialMode changes (navigation completes)
  useEffect(() => {
    if (initialMode !== displayMode) {
      setGlobalMode(initialMode);
    }
  }, [initialMode, displayMode, setGlobalMode]);

  const handleModeChange = (nextMode: SiteMode) => {
    if (nextMode === displayMode) return;
    if (isPending) return;
    
    // 1. Update mode globally (sets cookie, theme, html attribute immediately)
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

    // 3. Navigate or refresh
    if (targetPath !== pathname) {
      startTransition(() => {
        router.push(targetPath);
      });
    } else {
      // Same path - refresh to update Server Components with new cookie
      startTransition(() => {
        router.refresh();
      });
    }
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
        disabled={isPending}
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
        disabled={isPending}
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