'use client';

import { m, type Variants } from 'motion/react';
import { type ReactNode } from 'react';
import { instantReveal } from '@shared/lib/motion';

interface GalleryCardProps {
  children: ReactNode;
  variants: Variants | undefined;
  useLiteMotion: boolean;
  label?: string;
  testId: string;
  extra?: ReactNode;
}

/**
 * Wraps gallery media and its caption, revealing immediately when lite motion
 * is enabled.
 */
export default function GalleryCard({
  children,
  variants,
  useLiteMotion,
  label,
  testId,
  extra,
}: GalleryCardProps) {
  return (
    <m.figure
      className='group bg-muted relative overflow-hidden rounded-2xl'
      variants={variants}
      animate={useLiteMotion ? instantReveal : undefined}
      data-testid={testId}
    >
      <div className='relative aspect-4/3 overflow-hidden'>
        {children}
        <div
          className={
            useLiteMotion
              ? 'absolute inset-0 bg-black/0 transition-none'
              : 'absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10'
          }
        />
      </div>
      {label ? (
        <figcaption
          className={
            useLiteMotion
              ? 'text-muted-foreground mt-3 px-1 text-sm font-medium'
              : 'text-muted-foreground group-hover:text-primary mt-3 px-1 text-sm font-medium transition-colors'
          }
        >
          {label}
        </figcaption>
      ) : null}
      {extra}
    </m.figure>
  );
}
