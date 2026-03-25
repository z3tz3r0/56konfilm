'use client';

import { cn } from '@shared/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface ActiveLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}

export default function ActiveLink({
  href,
  children,
  className,
  activeClassName,
}: ActiveLinkProps) {
  const pathname = usePathname();

  // href เราตัด trailing slash จาก `withContextPrefix` ไปแล้ว
  // แต่ใส่ไว้เพื่อป้องกันเป็นปราการสุดท้าย
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  const normalizedHref = href.replace(/\/+$/, '') || '/';

  const isActive = normalizedPathname === normalizedHref;
  return (
    <Link href={href} className={cn(className, isActive && activeClassName)}>
      {children}
    </Link>
  );
}
