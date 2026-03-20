/**
 * Device Tier Classification System
 *
 * Classifies user devices into performance tiers for graceful degradation.
 * Uses browser capability signals without UA-sniffing.
 *
 * Tiers:
 * - low: constrained devices (reduced motion, data-saver, low concurrency)
 * - medium: capable devices with some limitations
 * - high: high-end devices with full capability
 */

import {
  DeviceCapabilities,
  DeviceTier,
  NavigatorWithConnection,
  TierFeatureFlags,
} from './deviceTier.types';

/**
 * Detects device capabilities from browser APIs
 * Safe for SSR - returns safe defaults when not in browser
 */
function getDeviceCapabilities(): DeviceCapabilities {
  // SSR safety: return safe defaults
  if (typeof window === 'undefined') {
    return {
      hardwareConcurrency: 4, // Assume medium
      saveData: false,
      prefersReducedMotion: false,
    };
  }

  const nav = navigator as NavigatorWithConnection;

  return {
    hardwareConcurrency: nav.hardwareConcurrency || 0,
    saveData: nav.connection?.saveData ?? false,
    prefersReducedMotion:
      window.matchMedia?.('(prefer-reduced-motion: reduce)').matches ?? false,
  };
}

/**
 * Classifies device into performance tier
 * Deterministic mapping: input capabilities -> tier output
 */
function classifyDeviceTier(
  capabilities: DeviceCapabilities = getDeviceCapabilities()
): DeviceTier {
  const { hardwareConcurrency, saveData, prefersReducedMotion } = capabilities;

  if (prefersReducedMotion || saveData) return 'low';
  if (hardwareConcurrency > 0 && hardwareConcurrency <= 2) return 'low';
  if (hardwareConcurrency <= 4) return 'medium';
  return 'high';
}

/**
 * Get feature flags for a given tier
 */
function getTierFeatureFlags(
  tier: DeviceTier = classifyDeviceTier()
): TierFeatureFlags {
  return {
    allowHeavyMotion: tier !== 'low',
    allowVideoAutoplay: tier !== 'low',
    useSimplifiedTransitions: tier === 'low',
  };
}

export { getDeviceCapabilities, classifyDeviceTier, getTierFeatureFlags };
