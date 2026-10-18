'use client';

import type { ReactNode } from 'react';
import { m, type Variants } from 'motion/react';
import { useDeviceTier } from '@shared/hooks';
import {
  fadeUpItemVariants,
  staggerContainerVariants,
  instantReveal,
} from '@shared/lib/motion';

interface AnimatedCollageImageProps {
  children: ReactNode;
  className: string;
  order: number;
}

/**
 * Reveals an image once with an order-based delay, or renders it without motion
 * when the initialized device tier disallows heavy animation.
 */
export default function AnimatedCollageImage({
  children,
  className,
  order,
}: AnimatedCollageImageProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();

  const useLiteMotion = isInitialized && !allowHeavyMotion;

  const { delayChildren, staggerChildren } =
    staggerContainerVariants.visible.transition;
  const variants = {
    hidden: fadeUpItemVariants.hidden,
    visible: {
      ...fadeUpItemVariants.visible,
      transition: {
        ...fadeUpItemVariants.visible.transition,
        delay: delayChildren + order * staggerChildren,
      },
    },
  } satisfies Variants;

  return (
    <m.div
      className={className}
      data-testid='wedding-gallery-image'
      initial={useLiteMotion ? false : 'hidden'}
      whileInView={useLiteMotion ? undefined : 'visible'}
      animate={useLiteMotion ? instantReveal : undefined}
      viewport={{ once: true, margin: '-100px' }}
      variants={useLiteMotion ? undefined : variants}
    >
      {children}
    </m.div>
  );
}
