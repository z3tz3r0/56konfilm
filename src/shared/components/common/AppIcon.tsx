'use client';
import { Icon, IconifyIconProps } from '@iconify/react';
import { cn } from '@shared/utils';

interface AppIconProps {
  iconName: IconifyIconProps['icon'];
  className?: string;
}

export default function AppIcon({ iconName, className }: AppIconProps) {
  return (
    <div
      className={cn(
        'bg-text-primary dark:bg-primary text-neutral mx-auto mb-4 grid h-[80px] w-[80px] place-items-center rounded-full',
        className
      )}
    >
      <Icon icon={iconName} style={{ width: 40, height: 40 }} />
    </div>
  );
}
