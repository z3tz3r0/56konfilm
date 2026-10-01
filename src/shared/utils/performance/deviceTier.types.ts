interface NetworkInformation extends EventTarget {
  readonly saveData: boolean;
}

interface NavigatorWithConnection extends Navigator {
  readonly connection?: NetworkInformation;
}

interface DeviceCapabilities {
  /** Number of logical processors (0 if unknown) */
  hardwareConcurrency: number;
  /** Whether data-saver mode is enabled */
  saveData: boolean;
  /** Whether reduced motion is preferred */
  prefersReducedMotion: boolean;
}

type DeviceTier = 'low' | 'medium' | 'high';

interface TierFeatureFlags {
  /** Whether heavy motion effects (parallax, blur) should be enabled */
  allowHeavyMotion: boolean;
  /** Whether video autoplay should be attempted */
  allowVideoAutoplay: boolean;
  /** Whether to use simplified transitions */
  useSimplifiedTransitions: boolean;
}

export type {
  NetworkInformation,
  NavigatorWithConnection,
  DeviceCapabilities,
  DeviceTier,
  TierFeatureFlags,
};
