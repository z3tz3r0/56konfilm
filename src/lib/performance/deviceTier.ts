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

export type DeviceTier = 'low' | 'medium' | 'high';

export interface DeviceCapabilities {
  /** Number of logical processors (0 if unknown) */
  hardwareConcurrency: number;
  /** Whether data-saver mode is enabled */
  saveData: boolean;
  /** Effective network type (4g, 3g, 2g, slow-2g, or null) */
  effectiveType: string | null;
  /** Whether reduced motion is preferred */
  prefersReducedMotion: boolean;
}

/**
 * Detects device capabilities from browser APIs
 * Safe for SSR - returns safe defaults when not in browser
 */
export function getDeviceCapabilities(): DeviceCapabilities {
  // SSR safety: return safe defaults
  if (typeof window === 'undefined') {
    return {
      hardwareConcurrency: 4, // Assume medium
      saveData: false,
      effectiveType: null,
      prefersReducedMotion: false,
    };
  }

  // Hardware concurrency - may be reduced by privacy controls
  const hardwareConcurrency = navigator.hardwareConcurrency || 0;

  // Network Information API (not supported in Safari)
  const connection = (navigator as Navigator & { 
    connection?: {
      saveData?: boolean;
      effectiveType?: string;
    };
  }).connection;
  
  const saveData = connection?.saveData ?? false;
  const effectiveType = connection?.effectiveType ?? null;

  // Reduced motion preference
  const prefersReducedMotion = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)'
  ).matches ?? false;

  return {
    hardwareConcurrency,
    saveData,
    effectiveType,
    prefersReducedMotion,
  };
}

/**
 * Classifies device into performance tier
 * Deterministic mapping: input capabilities -> tier output
 */
export function classifyDeviceTier(capabilities: DeviceCapabilities): DeviceTier {
  const { hardwareConcurrency, saveData, effectiveType, prefersReducedMotion } = capabilities;

  // Reduced motion always forces low tier (accessibility override)
  if (prefersReducedMotion) {
    return 'low';
  }

  // Data saver forces low tier
  if (saveData) {
    return 'low';
  }

  // Slow network types force low tier
  if (effectiveType === '2g' || effectiveType === 'slow-2g') {
    return 'low';
  }

  // Low hardware concurrency (1-2 cores) -> low tier
  // Note: 0 means unknown, treat as medium for safety
  if (hardwareConcurrency > 0 && hardwareConcurrency <= 2) {
    return 'low';
  }

  // 3G network with limited cores -> medium tier
  if (effectiveType === '3g' && hardwareConcurrency > 0 && hardwareConcurrency <= 4) {
    return 'medium';
  }

  // Limited cores (3-4) -> medium tier
  if (hardwareConcurrency >= 3 && hardwareConcurrency <= 4) {
    return 'medium';
  }

  // High concurrency (5+ cores) or unknown with no constraints -> high tier
  return 'high';
}

/**
 * Get current device tier
 * Convenience function that detects capabilities and classifies in one call
 */
export function getDeviceTier(): DeviceTier {
  return classifyDeviceTier(getDeviceCapabilities());
}

/**
 * Tier-based feature flags
 */
export interface TierFeatureFlags {
  /** Whether heavy motion effects (parallax, blur) should be enabled */
  allowHeavyMotion: boolean;
  /** Whether video autoplay should be attempted */
  allowVideoAutoplay: boolean;
  /** Whether to use simplified transitions */
  useSimplifiedTransitions: boolean;
}

/**
 * Get feature flags for a given tier
 */
export function getTierFeatureFlags(tier: DeviceTier): TierFeatureFlags {
  switch (tier) {
    case 'low':
      return {
        allowHeavyMotion: false,
        allowVideoAutoplay: false,
        useSimplifiedTransitions: true,
      };
    case 'medium':
      return {
        allowHeavyMotion: true,
        allowVideoAutoplay: true,
        useSimplifiedTransitions: false,
      };
    case 'high':
      return {
        allowHeavyMotion: true,
        allowVideoAutoplay: true,
        useSimplifiedTransitions: false,
      };
  }
}
