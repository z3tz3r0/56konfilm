'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Scrolls to the top after pathname changes from ordinary client navigation.
 * Leaves initial loads, query-only changes, and Back/Forward navigation alone
 * so browser or Next.js scroll restoration can apply. Renders no content.
 */
export default function RouteScrollController() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const historyPathname = useRef<string | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      const destinationPathname = window.location.pathname;
      // Query-only history changes must not affect the next page navigation.
      historyPathname.current =
        destinationPathname === previousPathname.current
          ? null
          : destinationPathname;
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useLayoutEffect(() => {
    if (pathname === previousPathname.current) return;

    const isHistoryNavigation = historyPathname.current === pathname;
    previousPathname.current = pathname;
    historyPathname.current = null;

    // Next.js may retain scroll when the new page is already in the viewport.
    if (!isHistoryNavigation) window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
