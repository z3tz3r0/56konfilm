import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDeviceFeatureFlags, useDeviceTier } from '@/hooks/useDeviceTier';

vi.mock('@/lib/performance/deviceTier', () => ({
  getDeviceCapabilities: vi.fn(() => ({
    hardwareConcurrency: 2,
    saveData: true,
    effectiveType: '2g',
    prefersReducedMotion: false,
  })),
  classifyDeviceTier: vi.fn(() => 'low'),
  getTierFeatureFlags: vi.fn(() => ({
    allowHeavyMotion: false,
    allowVideoAutoplay: false,
    useSimplifiedTransitions: true,
  })),
}));

describe('useDeviceTier', () => {
  it('uses low-safe tier defaults in initial render path', () => {
    const { result } = renderHook(() => useDeviceTier());

    expect(result.current.tier).toBe('low');
    expect(result.current.allowHeavyMotion).toBe(false);
    expect(result.current.allowVideoAutoplay).toBe(false);
    expect(result.current.useSimplifiedTransitions).toBe(true);
  });

  it('resolves tier and feature flags after client effect', async () => {
    const { result } = renderHook(() => useDeviceTier());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.tier).toBe('low');
    expect(result.current.isLowPower).toBe(true);
    expect(result.current.allowHeavyMotion).toBe(false);
    expect(result.current.allowVideoAutoplay).toBe(false);
    expect(result.current.useSimplifiedTransitions).toBe(true);
  });

  it('useDeviceFeatureFlags returns subset flags plus initialization state', async () => {
    const { result } = renderHook(() => useDeviceFeatureFlags());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current).toEqual({
      allowHeavyMotion: false,
      allowVideoAutoplay: false,
      useSimplifiedTransitions: true,
      isInitialized: true,
    });
  });
});
