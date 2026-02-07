'use client';

import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useMode } from '@/hooks/useMode';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
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
  const { useSimplifiedTransitions } = useDeviceTier();

  // If targetMode is wedding (Light), curtain is Ivory/White
  // If targetMode is production (Dark), curtain is Black
  const curtainColor = targetMode === 'wedding' ? '#faf7f2' : '#00040d';
  const easeOutExpo = [0.22, 1, 0.36, 1] as const;

  // Reduced motion users get no animation at all (accessibility)
  if (prefersReducedMotion) {
    return null;
  }

  // Easing curves for simplified transitions
  const easeOut = [0, 0, 0.2, 1] as const;
  const easeIn = [0.4, 0, 1, 1] as const;

  // Low-power devices: use simplified opacity transition (no transform/blur)
  const simplifiedVariants: Variants = {
    hidden: { opacity: 0 },
    enter: {
      opacity: 1,
      transition: { duration: durations.fast, ease: easeOut },
    },
    exit: {
      opacity: 0,
      transition: { duration: durations.fast, ease: easeIn },
    },
  };

  // High-end devices: full cinematic scaleY transition
  const fullMotionVariants: Variants = {
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
  };

  const variants = useSimplifiedTransitions ? simplifiedVariants : fullMotionVariants;
  const animationDuration = useSimplifiedTransitions ? durations.fast : durations.slow;

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          data-testid="curtain"
          className="fixed inset-0 z-9999"
          initial="hidden"
          animate="enter"
          exit="exit"
          variants={variants}
          style={{ 
            backgroundColor: curtainColor, 
            willChange: useSimplifiedTransitions ? 'opacity' : 'transform',
          }}
          onAnimationStart={() => {
            // Safety fallback: if animation doesn't complete (e.g. reduced motion or CI lag), 
            // force state update after expected duration + buffer
            setTimeout(() => setIsCovered(true), animationDuration * 1000 + 100);
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
