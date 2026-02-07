/**
 * Unit tests for Device Tier Classification System
 *
 * Tests the deterministic mapping of browser capabilities to device tiers.
 */

import {
    classifyDeviceTier,
    getDeviceCapabilities,
    getTierFeatureFlags,
    type DeviceCapabilities,
} from '@/lib/performance/deviceTier';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('deviceTier', () => {
  describe('classifyDeviceTier', () => {
    const baseCapabilities: DeviceCapabilities = {
      hardwareConcurrency: 8,
      saveData: false,
      effectiveType: '4g',
      prefersReducedMotion: false,
    };

    it('returns "high" for high-end device (8+ cores, 4g, no constraints)', () => {
      const tier = classifyDeviceTier(baseCapabilities);
      expect(tier).toBe('high');
    });

    it('returns "low" when prefersReducedMotion is true (accessibility override)', () => {
      const tier = classifyDeviceTier({
        ...baseCapabilities,
        prefersReducedMotion: true,
      });
      expect(tier).toBe('low');
    });

    it('returns "low" when saveData is true', () => {
      const tier = classifyDeviceTier({
        ...baseCapabilities,
        saveData: true,
      });
      expect(tier).toBe('low');
    });

    it('returns "low" for 2g network', () => {
      const tier = classifyDeviceTier({
        ...baseCapabilities,
        effectiveType: '2g',
      });
      expect(tier).toBe('low');
    });

    it('returns "low" for slow-2g network', () => {
      const tier = classifyDeviceTier({
        ...baseCapabilities,
        effectiveType: 'slow-2g',
      });
      expect(tier).toBe('low');
    });

    it('returns "low" for low hardware concurrency (1-2 cores)', () => {
      const tier = classifyDeviceTier({
        ...baseCapabilities,
        hardwareConcurrency: 2,
      });
      expect(tier).toBe('low');
    });

    it('returns "medium" for 3g network with limited cores (3-4)', () => {
      const tier = classifyDeviceTier({
        ...baseCapabilities,
        effectiveType: '3g',
        hardwareConcurrency: 4,
      });
      expect(tier).toBe('medium');
    });

    it('returns "medium" for medium hardware concurrency (3-4 cores)', () => {
      const tier = classifyDeviceTier({
        ...baseCapabilities,
        hardwareConcurrency: 4,
      });
      expect(tier).toBe('medium');
    });

    it('returns "high" when hardwareConcurrency is unknown (0)', () => {
      // Unknown hardware should default to high to avoid degrading unnecessarily
      const tier = classifyDeviceTier({
        ...baseCapabilities,
        hardwareConcurrency: 0,
      });
      expect(tier).toBe('high');
    });

    it('returns "high" for 5+ cores device', () => {
      const tier = classifyDeviceTier({
        ...baseCapabilities,
        hardwareConcurrency: 6,
      });
      expect(tier).toBe('high');
    });

    it('reduced motion takes precedence over all other signals', () => {
      const tier = classifyDeviceTier({
        hardwareConcurrency: 16,
        saveData: false,
        effectiveType: '4g',
        prefersReducedMotion: true,
      });
      expect(tier).toBe('low');
    });
  });

  describe('getTierFeatureFlags', () => {
    it('returns disabled features for low tier', () => {
      const flags = getTierFeatureFlags('low');
      expect(flags).toEqual({
        allowHeavyMotion: false,
        allowVideoAutoplay: false,
        useSimplifiedTransitions: true,
      });
    });

    it('returns enabled features for medium tier', () => {
      const flags = getTierFeatureFlags('medium');
      expect(flags).toEqual({
        allowHeavyMotion: true,
        allowVideoAutoplay: true,
        useSimplifiedTransitions: false,
      });
    });

    it('returns enabled features for high tier', () => {
      const flags = getTierFeatureFlags('high');
      expect(flags).toEqual({
        allowHeavyMotion: true,
        allowVideoAutoplay: true,
        useSimplifiedTransitions: false,
      });
    });
  });

  describe('getDeviceCapabilities', () => {
    const originalWindow = global.window;
    const originalNavigator = global.navigator;

    beforeEach(() => {
      // Reset mocks
      vi.restoreAllMocks();
    });

    afterEach(() => {
      // Restore original window
      global.window = originalWindow;
      global.navigator = originalNavigator;
    });

    it('returns safe defaults when window is undefined (SSR)', () => {
      // @ts-expect-error - simulating SSR environment
      global.window = undefined;

      const capabilities = getDeviceCapabilities();
      expect(capabilities).toEqual({
        hardwareConcurrency: 4,
        saveData: false,
        effectiveType: null,
        prefersReducedMotion: false,
      });
    });

    it('reads hardwareConcurrency from navigator', () => {
      // Mock browser environment
      global.window = {} as Window & typeof globalThis;
      Object.defineProperty(global, 'navigator', {
        value: {
          hardwareConcurrency: 8,
        },
        writable: true,
        configurable: true,
      });
      global.window.matchMedia = vi.fn().mockReturnValue({ matches: false });

      const capabilities = getDeviceCapabilities();
      expect(capabilities.hardwareConcurrency).toBe(8);
    });

    it('reads saveData from navigator.connection', () => {
      global.window = {} as Window & typeof globalThis;
      Object.defineProperty(global, 'navigator', {
        value: {
          hardwareConcurrency: 4,
          connection: {
            saveData: true,
            effectiveType: '3g',
          },
        },
        writable: true,
        configurable: true,
      });
      global.window.matchMedia = vi.fn().mockReturnValue({ matches: false });

      const capabilities = getDeviceCapabilities();
      expect(capabilities.saveData).toBe(true);
      expect(capabilities.effectiveType).toBe('3g');
    });

    it('handles missing connection API gracefully (Safari)', () => {
      global.window = {} as Window & typeof globalThis;
      Object.defineProperty(global, 'navigator', {
        value: {
          hardwareConcurrency: 4,
          // No connection property
        },
        writable: true,
        configurable: true,
      });
      global.window.matchMedia = vi.fn().mockReturnValue({ matches: false });

      const capabilities = getDeviceCapabilities();
      expect(capabilities.saveData).toBe(false);
      expect(capabilities.effectiveType).toBe(null);
    });

    it('reads prefers-reduced-motion media query', () => {
      global.window = {} as Window & typeof globalThis;
      Object.defineProperty(global, 'navigator', {
        value: { hardwareConcurrency: 4 },
        writable: true,
        configurable: true,
      });
      global.window.matchMedia = vi.fn().mockReturnValue({ matches: true });

      const capabilities = getDeviceCapabilities();
      expect(capabilities.prefersReducedMotion).toBe(true);
    });
  });
});
