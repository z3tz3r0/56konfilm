import { useSyncExternalStore } from 'react';

let videoAutoplay = true;
const listeners = new Set<() => void>();

export function setVideoAutoplay(allow: boolean) {
  videoAutoplay = allow;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useDeviceTier() {
  const allowVideoAutoplay = useSyncExternalStore(
    subscribe,
    () => videoAutoplay,
    () => videoAutoplay
  );
  return { isInitialized: true, allowHeavyMotion: false, allowVideoAutoplay };
}
