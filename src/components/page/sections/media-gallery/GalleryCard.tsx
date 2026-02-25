'use client';

import { m, type Variants } from 'motion/react';
import { type ReactNode } from 'react';

interface GalleryCardProps {
  children: ReactNode;
  variants: Variants | undefined;
  useLiteMotion: boolean;
  label?: string;
  testId: string;
  extra?: ReactNode;
}

export function GalleryCard({
  children,
  variants,
  useLiteMotion,
  label,
  testId,
  extra,
}: GalleryCardProps) {
  return (
    <m.figure
      className="group relative overflow-hidden rounded-2xl bg-muted"
      variants={variants}
      data-testid={testId}
    >
      <div className="relative aspect-4/3 overflow-hidden">
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
              ? 'mt-3 px-1 text-sm font-medium text-muted-foreground'
              : 'mt-3 px-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary'
          }
        >
          {label}
        </figcaption>
      ) : null}
      {extra}
    </m.figure>
  );
}
