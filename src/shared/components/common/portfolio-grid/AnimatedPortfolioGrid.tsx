'use client';

import { Children, type ReactNode } from 'react';
import { m } from 'motion/react';
import { useDeviceTier } from '@shared/hooks';
import {
  staggerContainerVariants,
  fadeUpItemVariants,
  instantReveal,
} from '@shared/lib/motion';

interface AnimatedPortfolioGridProps {
  children: ReactNode;
  className: string;
}

/**
 * Reveals child cards with a staggered animation once the grid enters the viewport.
 * Disables motion without replacing cards when the initialized device tier changes.
 */
export default function AnimatedPortfolioGrid({
  children,
  className,
}: AnimatedPortfolioGridProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();

  const useLiteMotion = isInitialized && !allowHeavyMotion;

  return (
    <m.section
      className={className}
      initial={useLiteMotion ? false : 'hidden'}
      whileInView={useLiteMotion ? undefined : 'visible'}
      animate={useLiteMotion ? instantReveal : undefined}
      viewport={{ once: true, margin: '-100px' }}
      variants={useLiteMotion ? undefined : staggerContainerVariants}
    >
      {Children.map(children, (child) => (
        <m.div
          className='row-span-2 grid grid-rows-subgrid'
          animate={useLiteMotion ? instantReveal : undefined}
          variants={useLiteMotion ? undefined : fadeUpItemVariants}
        >
          {child}
        </m.div>
      ))}
    </m.section>
  );
}
