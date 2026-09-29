'use client';
import { Icon, IconifyIconProps } from '@iconify/react';
import type { ReactNode } from 'react';
import { cn } from '@shared/utils';

interface AppIconProps {
  iconName?: IconifyIconProps['icon'];
  className?: string;
  iconClassName?: string;
  variant?: 'circle' | 'plain';
  children?: ReactNode;
}

export default function AppIcon({
  iconName,
  className,
  iconClassName,
  variant = 'circle',
  children,
}: AppIconProps) {
  return (
    <div
      data-slot='app-icon'
      data-variant={variant}
      className={cn(
        variant === 'circle'
          ? 'bg-text-primary dark:bg-primary text-neutral mx-auto grid size-20 place-items-center rounded-full'
          : 'grid size-12 place-items-center',
        className
      )}
    >
      {iconName ? (
        <Icon
          icon={iconName}
          className={cn(
            variant === 'circle' ? 'size-10' : 'size-full',
            iconClassName
          )}
        />
      ) : (
        children
      )}
    </div>
  );
}
