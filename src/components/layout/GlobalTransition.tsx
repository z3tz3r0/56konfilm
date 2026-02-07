'use client';

import { useMode } from '@/hooks/useMode';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

function resolveDurations() {
  if (typeof window === 'undefined') {
    return { slow: 1.0, fast: 0.3 };
  }

  const styles = getComputedStyle(document.documentElement);
  const slow = parseFloat(styles.getPropertyValue('--duration-slow'));
  const fast = parseFloat(styles.getPropertyValue('--duration-fast'));

  return {
    slow: Number.isFinite(slow) ? slow : 1.0,
    fast: Number.isFinite(fast) ? fast : 0.3,
  };
}

export const GlobalTransition = () => {
  const { isTransitioning, targetMode, setIsCovered } = useMode();
  const [durations] = useState(resolveDurations);
  const prefersReducedMotion = useReducedMotion();

  // If targetMode is wedding (Light), curtain is Ivory/White
  // If targetMode is production (Dark), curtain is Black
  const curtainColor = targetMode === 'wedding' ? '#faf7f2' : '#00040d';
  const easeOutExpo = [0.22, 1, 0.36, 1] as const;

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          data-testid="curtain"
          className="fixed inset-0 z-9999"
          initial="hidden"
          animate="enter"
          exit="exit"
          variants={{
            hidden: { scaleY: 0, transformOrigin: 'top' },
            enter: {
              scaleY: 1,
              transformOrigin: 'top',
              transition: { duration: durations.slow, ease: easeOutExpo },
            },
            exit: {
              scaleY: 0,
              transformOrigin: 'bottom',
              transition: { duration: durations.fast, ease: easeOutExpo },
            },
          }}
          style={{ backgroundColor: curtainColor, willChange: 'transform' }}
          onAnimationStart={() => {
            // Safety fallback: if animation doesn't complete (e.g. reduced motion or CI lag), 
            // force state update after expected duration + buffer
            setTimeout(() => setIsCovered(true), durations.slow * 1000 + 100);
          }}
          onAnimationComplete={(definition) => {
            if (definition === 'enter') setIsCovered(true);
            if (definition === 'exit') setIsCovered(false);
          }}
        />
      )}
    </AnimatePresence>
  );
};
