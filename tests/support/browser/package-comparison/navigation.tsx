import { useSyncExternalStore, type ComponentProps } from 'react';

/**
 * Subscribes to same-document history navigation and returns listener cleanup.
 */
function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener);
  return () => window.removeEventListener('popstate', listener);
}

/** Same-document URL reads without a Next server or route data requests. */
export function useSearchParams() {
  return new URLSearchParams(
    useSyncExternalStore(
      subscribe,
      () => window.location.search,
      () => ''
    )
  );
}
/**
 * Reads the browser pathname and updates on popstate without a Next.js router.
 */
export function usePathname() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => '/'
  );
}
/**
 * Renders a native anchor for the offline package-comparison fixture.
 */
export default function FixtureLink(props: ComponentProps<'a'>) {
  return <a {...props} />;
}
