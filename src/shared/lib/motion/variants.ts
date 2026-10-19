import type { TargetAndTransition, Variants } from 'motion/react';

/** Cancel an in-flight reveal without leaving stale opacity or transforms behind. */
export const instantReveal = {
  opacity: 1,
  x: 0,
  y: 0,
  transition: { duration: 0, delay: 0 },
} satisfies TargetAndTransition;

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
} satisfies Variants;

export const fadeUpItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
} satisfies Variants;
