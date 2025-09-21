'use client';

import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { setModeCookie } from '@/actions/setModeCookie';
import { isSupportedMode, type SiteMode } from '@/lib/preferences';
import { cn } from '@/lib/utils';

import { motion } from 'motion/react';

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

  const handleModeChange = (value: string) => {
    if (!isSupportedMode(value) || value === mode) {
      return;
    }

    const nextMode = value as SiteMode;

    startTransition(async () => {
      try {
        await setModeCookie(nextMode);
        setMode(nextMode);
        setTheme(MODE_TO_THEME[nextMode]);
        router.refresh();
      } catch (error) {
        console.error('Failed to update mode: ', error);
        setMode(mode);
        setTheme(MODE_TO_THEME[mode]);
      }
    });
  };

  return (
    <motion.div
      className={cn(
        'relative grid h-11 w-60 grid-cols-2 items-center rounded-md p-1'
      )}
      animate={{
        backgroundColor:
          mode === 'production'
            ? '#00040d' // midnight-black
            : '#5b4339', // brown
      }}
    >
      {/* Sliding indicator */}
      <motion.span
        className={cn(
          'bg-ivory-white pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-0.5rem)] rounded-sm'
        )}
        animate={{
          x: mode === 'production' ? 0 : 'calc(100% + 0.5rem)',
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
      />

      {/* Production button */}
      <motion.button
        onClick={() => handleModeChange('production')}
        disabled={isPending}
        className={cn(
          'relative z-10 h-full cursor-pointer text-xs font-semibold tracking-[0.25em] uppercase',

          isPending && 'cursor-not-allowed opacity-60'
        )}
        animate={{
          color:
            mode === 'production'
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
        disabled={isPending}
        className={cn(
          'relative z-10 h-full cursor-pointer text-xs font-semibold tracking-[0.25em] uppercase',
          isPending && 'cursor-not-allowed opacity-60'
        )}
        animate={{
          color: mode === 'wedding' ? '#5b4339' : '#faf7f2', // text-brown : text-ivory-white
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
