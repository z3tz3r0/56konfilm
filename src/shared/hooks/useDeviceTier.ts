'use client';

import {
  classifyDeviceTier,
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
  isInitialized: false,
};
type DeviceTierResult = typeof SSR_SNAPSHOT;

let clientSnapshotCache: DeviceTierResult | null = null;

export function useDeviceTier() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      if (!clientSnapshotCache) {
        const tier = classifyDeviceTier();
        const tierFeatureFlags = getTierFeatureFlags(tier);
        clientSnapshotCache = {
          tier,
          isLowPower: tier === 'low',
          ...tierFeatureFlags,
          isInitialized: true,
        };
      }
      return clientSnapshotCache;
    },
    () => SSR_SNAPSHOT
  );
}
