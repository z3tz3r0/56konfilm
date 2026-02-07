'use client';

import {
  classifyDeviceTier,
  getDeviceCapabilities,
  getTierFeatureFlags,
  type DeviceTier,
  type TierFeatureFlags,
} from '@/lib/performance/deviceTier';
import { useSyncExternalStore } from 'react';

export interface UseDeviceTierResult {
  /** Current device tier classification */
  tier: DeviceTier;
  /** Whether the device is considered low-power */
  isLowPower: boolean;
  /** Whether heavy motion effects (parallax, blur) should be enabled */
  allowHeavyMotion: boolean;
  /** Whether video autoplay should be attempted */
  allowVideoAutoplay: boolean;
  /** Whether to use simplified transitions */
  useSimplifiedTransitions: boolean;
  /** Whether the hook has initialized (false during SSR/hydration) */
  isInitialized: boolean;
}

// Default values for SSR/hydration-safe first paint.
// Start conservatively (no autoplay/heavy motion) until client capabilities are known.
const SSR_DEFAULTS: UseDeviceTierResult = {
  tier: 'low',
  isLowPower: true,
  allowHeavyMotion: false,
  allowVideoAutoplay: false,
  useSimplifiedTransitions: true,
  isInitialized: false,
};

// Cached client result - computed once on client
let clientCapabilitiesResult: UseDeviceTierResult | null = null;

function getClientCapabilities(): UseDeviceTierResult {
  if (!clientCapabilitiesResult) {
    const capabilities = getDeviceCapabilities();
    const tier = classifyDeviceTier(capabilities);
    const flags = getTierFeatureFlags(tier);

    clientCapabilitiesResult = {
      tier,
      isLowPower: tier === 'low',
      allowHeavyMotion: flags.allowHeavyMotion,
      allowVideoAutoplay: flags.allowVideoAutoplay,
      useSimplifiedTransitions: flags.useSimplifiedTransitions,
      isInitialized: true,
    };
  }
  return clientCapabilitiesResult;
}

// External store callbacks for useSyncExternalStore
const subscribe = () => () => {}; // No subscription needed - capabilities don't change
const getSnapshot = getClientCapabilities;
const getServerSnapshot = () => SSR_DEFAULTS;

/**
 * Hook for consuming device tier classification in UI components
 *
 * Features:
 * - SSR-safe: returns safe defaults during server render
 * - No hydration mismatch: uses useSyncExternalStore for proper hydration
 * - Exposes tier-based feature booleans for conditional rendering
 *
 * @example
 * ```tsx
 * const { allowHeavyMotion, allowVideoAutoplay } = useDeviceTier();
 *
 * if (!allowHeavyMotion) {
 *   return <SimpleTransition />;
 * }
 * return <FullMotionTransition />;
 * ```
 */
export function useDeviceTier(): UseDeviceTierResult {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Hook for getting only the feature flags without tier info
 * Convenience hook for components that only need the boolean flags
 */
export function useDeviceFeatureFlags(): TierFeatureFlags & { isInitialized: boolean } {
  const { allowHeavyMotion, allowVideoAutoplay, useSimplifiedTransitions, isInitialized } =
    useDeviceTier();

  return {
    allowHeavyMotion,
    allowVideoAutoplay,
    useSimplifiedTransitions,
    isInitialized,
  };
}

