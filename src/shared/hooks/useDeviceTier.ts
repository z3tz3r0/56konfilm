'use client';

import {
  classifyDeviceTier,
  getDeviceCapabilities,
  getTierFeatureFlags,
} from '@shared/utils/performance/deviceTier';
import type { DeviceTier } from '@shared/utils/performance/deviceTier.types';
import { useSyncExternalStore } from 'react';

const SSR_SNAPSHOT = {
  tier: 'low' as DeviceTier,
  isLowPower: true,
  allowHeavyMotion: false,
  allowVideoAutoplay: false,
  useSimplifiedTransitions: true,
  prefersReducedMotion: false,
  isInitialized: false,
};
type DeviceTierResult = typeof SSR_SNAPSHOT;

let clientSnapshotCache: DeviceTierResult | null = null;
const listeners = new Set<() => void>();
let stopListening: (() => void) | undefined;

/** Read both the raw preference and derived flags from the same capabilities. */
function refreshSnapshot() {
  const capabilities = getDeviceCapabilities();
  const tier = classifyDeviceTier(capabilities);

  if (
    !clientSnapshotCache ||
    clientSnapshotCache.tier !== tier ||
    clientSnapshotCache.prefersReducedMotion !==
      capabilities.prefersReducedMotion
  ) {
    clientSnapshotCache = {
      tier,
      isLowPower: tier === 'low',
      ...getTierFeatureFlags(tier),
      prefersReducedMotion: capabilities.prefersReducedMotion,
      isInitialized: true,
    };
  }

  return clientSnapshotCache;
}

function notifyChange() {
  const previous = clientSnapshotCache;
  if (refreshSnapshot() !== previous) {
    listeners.forEach((listener) => listener());
  }
}

/** One browser subscription is shared by all mounted hook consumers. */
function subscribe(listener: () => void) {
  listeners.add(listener);

  if (listeners.size === 1) {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    media?.addEventListener?.('change', notifyChange);
    stopListening = () => media?.removeEventListener?.('change', notifyChange);
    // Refresh after subscribing to cover changes since render or the last mount.
    notifyChange();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopListening?.();
      stopListening = undefined;
    }
  };
}

function getClientSnapshot() {
  // No listener could have updated the cache while every consumer was unmounted.
  return !clientSnapshotCache || listeners.size === 0
    ? refreshSnapshot()
    : clientSnapshotCache;
}

function getServerSnapshot() {
  return SSR_SNAPSHOT;
}

/** Raw motion preference is independent of low-tier hardware/data-saver policy. */
export function useDeviceTier() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
