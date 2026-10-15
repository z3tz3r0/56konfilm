'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '@shared/utils/styling/tailwindUtils';

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot='tabs'
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

/** Renders the tab list with default or segmented presentation. */
function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: 'default' | 'segmented';
}) {
  return (
    <TabsPrimitive.List
      data-slot='tabs-list'
      data-variant={variant}
      className={cn(
        'inline-flex items-center justify-center p-1',
        variant === 'default'
          ? 'bg-muted text-muted-foreground h-9 rounded-md shadow-inner'
          : 'bg-card text-card-foreground flex-wrap gap-1 rounded-full',
        className
      )}
      {...props}
    />
  );
}

/** Renders an accessible tab trigger with styling for the chosen presentation. */
function TabsTrigger({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: 'default' | 'segmented';
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      data-variant={variant}
      className={cn(
        'focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex flex-1 items-center justify-center whitespace-nowrap transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        variant === 'default'
          ? 'rounded-md px-3 py-1.5 text-sm font-semibold data-[state=inactive]:opacity-70'
          : 'text-text-primary data-[state=active]:text-primary-foreground isolate max-w-full min-w-0 flex-none rounded-full px-4 py-4 text-base font-medium wrap-anywhere whitespace-normal hover:cursor-pointer',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot='tabs-content'
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
