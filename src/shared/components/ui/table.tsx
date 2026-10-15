'use client';

import * as React from 'react';
import { cn } from '@shared/utils/styling/tailwindUtils';

// ShadCN Table, with an opt-in content-sized comparison appearance.
/** Wraps a semantic table in a scroll container with default or comparison styling. */
function Table({
  className,
  variant = 'default',
  containerRef,
  containerClassName,
  ...props
}: React.ComponentProps<'table'> & {
  variant?: 'default' | 'comparison';
  containerRef?: React.Ref<HTMLDivElement>;
  containerClassName?: string;
}) {
  return (
    <div
      ref={containerRef}
      data-slot='table-container'
      data-variant={variant}
      className={cn(
        'relative overflow-x-auto',
        variant === 'default'
          ? 'w-full'
          : 'border-titanium-white bg-card text-card-foreground w-fit max-w-full rounded-2xl border',
        containerClassName
      )}
    >
      <table
        data-slot='table'
        className={cn(
          'caption-bottom',
          variant === 'default'
            ? 'w-full text-sm'
            : '[&_td]:border-titanium-white [&_th]:border-titanium-white [&_thead_tr]:border-titanium-white w-max text-base [&_tbody_th]:py-4 [&_tbody_th]:text-xl [&_tbody_tr]:border-0 [&_tbody_tr:hover]:bg-transparent [&_td]:border-r [&_td]:px-8 [&_td]:py-4 [&_td]:text-center [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:px-8 [&_th:last-child]:border-r-0 [&_thead_th]:h-auto [&_thead_th]:py-8 [&_thead_th]:text-center [&_thead_th]:align-bottom',
          className
        )}
        {...props}
      />
    </div>
  );
}

/** Renders the table header group with shared row border styling. */
function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot='table-header'
      className={cn('[&_tr]:border-b', className)}
      {...props}
    />
  );
}

/** Renders the table body group without a border on its last row. */
function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot='table-body'
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

/** Renders the table footer group with a muted background and top border. */
function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot='table-footer'
      className={cn(
        'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  );
}

/** Renders a table row with shared hover and selection styling. */
function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot='table-row'
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted has-aria-expanded:bg-muted/50 border-b transition-colors',
        className
      )}
      {...props}
    />
  );
}

/** Renders a header cell, forwarding native props such as scope and ID. */
function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot='table-head'
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
}

/** Renders a data cell with shared spacing and checkbox alignment. */
function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot='table-cell'
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
}

/** Renders a table caption with shared muted text styling. */
function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot='table-caption'
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
