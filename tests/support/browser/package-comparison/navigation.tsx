import { useSyncExternalStore, type ComponentProps } from 'react';

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
export function usePathname() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => '/'
  );
}
export default function FixtureLink(props: ComponentProps<'a'>) {
  return <a {...props} />;
}
