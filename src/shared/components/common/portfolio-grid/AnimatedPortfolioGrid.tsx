'use client';

import { Children, type ReactNode } from 'react';
import { m } from 'motion/react';
import { useDeviceTier } from '@shared/hooks';
import {
  staggerContainerVariants,
  fadeUpItemVariants,
} from '@shared/lib/motion';

interface AnimatedPortfolioGridProps {
  children: ReactNode;
  className: string;
}

export default function AnimatedPortfolioGrid({
  children,
  className,
}: AnimatedPortfolioGridProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();

  if (isInitialized && !allowHeavyMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <m.section
      className={className}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerContainerVariants}
    >
      {Children.map(children, (child) => (
        <m.div
          className='row-span-2 grid grid-rows-subgrid'
          variants={fadeUpItemVariants}
        >
          {child}
        </m.div>
      ))}
    </m.section>
  );
}
