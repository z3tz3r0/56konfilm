'use client';

import { cn } from '@shared/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ComponentProps } from 'react';

interface ActiveLinkProps extends ComponentProps<typeof Link> {
  className?: string;
  activeClassName?: string;
}

export default function ActiveLink({
  href,
  children,
  className,
  activeClassName,
  ref,
  ...props
}: ActiveLinkProps) {
  const pathname = usePathname();
  const hrefString = typeof href === 'string' ? href : href.pathname || '/';

  // href เราตัด trailing slash จาก `withContextPrefix` ไปแล้ว
  // แต่ใส่ไว้เพื่อป้องกันเป็นปราการสุดท้าย
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  const normalizedHref = hrefString.replace(/\/+$/, '') || '/';

  const isActive = normalizedPathname === normalizedHref;
  return (
    <Link
      ref={ref}
      href={href}
      className={cn(className, isActive && activeClassName)}
      {...props}
    >
      {children}
    </Link>
  );
}
