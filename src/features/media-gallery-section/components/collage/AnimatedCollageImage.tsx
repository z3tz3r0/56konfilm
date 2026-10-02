'use client';

import type { ReactNode } from 'react';
import { m, type Variants } from 'motion/react';
import { useDeviceTier } from '@shared/hooks';
import {
  fadeUpItemVariants,
  staggerContainerVariants,
} from '@shared/lib/motion';

interface AnimatedCollageImageProps {
  children: ReactNode;
  className: string;
  order: number;
}

export default function AnimatedCollageImage({
  children,
  className,
  order,
}: AnimatedCollageImageProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();

  if (isInitialized && !allowHeavyMotion) {
    return <div className={className}>{children}</div>;
  }

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
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-100px' }}
      variants={variants}
    >
      {children}
    </m.div>
  );
}
