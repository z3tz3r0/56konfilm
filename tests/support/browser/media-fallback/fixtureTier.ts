import { useSyncExternalStore } from 'react';

let videoAutoplay = true;
const listeners = new Set<() => void>();

/** Update the fixture autoplay policy and notify subscribed consumers. */
export function setVideoAutoplay(allow: boolean) {
  videoAutoplay = allow;
  listeners.forEach((listener) => listener());
}

/** Subscribe to fixture policy changes and return the listener cleanup function. */
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Expose the reactive fixture autoplay policy with heavy motion disabled and initialization complete. */
export function useDeviceTier() {
  const allowVideoAutoplay = useSyncExternalStore(
    subscribe,
    () => videoAutoplay,
    () => videoAutoplay
  );
  return { isInitialized: true, allowHeavyMotion: false, allowVideoAutoplay };
}
