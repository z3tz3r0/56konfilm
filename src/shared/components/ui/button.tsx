import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@shared/utils';

const buttonVariants = cva(
  'cursor-pointer inline-flex items-center justify-center gap-2 font-medium transition-all disabled:cursor-not-allowed disabled:opacity-30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:rounded-full dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default:
          'shadow-xs hover:shadow-[0_0_10px_var(--primary)] bg-primary text-primary-foreground',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        secondary:
          'text-primary border-2 border-primary shadow-xs hover:not-disabled:bg-primary hover:not-disabled:text-primary-foreground dark:border-primary dark:hover:not-disabled:text-background dark:hover:not-disabled:bg-primary',
        neutral:
          'bg-neutral text-neutral-foreground shadow-xs hover:not-disabled:text-primary-foreground hover:not-disabled:bg-primary dark:hover:not-disabled:bg-background dark:hover:not-disabled:text-text-primary',
        ghost: 'hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-6 py-3 has-[>svg]:px-3',
        sm: 'text-xs gap-1.5 border px-3 py-1.5 has-[>svg]:px-2.5',
        md: 'text-sm px-4 py-1.5 has-[>svg]:px-3',
        lg: 'text-sm px-6 py-2 has-[>svg]:px-4',
        icon: 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot='button'
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
