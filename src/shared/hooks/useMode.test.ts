import { useModeStore } from '@shared/stores';
import { useMode } from '@shared/hooks';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useMode Hook', () => {
  beforeEach(() => {
    // Reset store and mocks before each test
    act(() => {
      useModeStore.setState({ mode: 'production' });
    });

    // Clear cookie (simple mock)
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  it('should return default mode as production', () => {
    const { result } = renderHook(() => useMode());
    expect(result.current.mode).toBe('production');
  });

  it('should toggle mode correctly', () => {
    const { result } = renderHook(() => useMode());

    act(() => {
      result.current.toggleMode();
    });

    // 1. Check Zustand state
    expect(result.current.mode).toBe('wedding');

    // 2. Check Cookie (basic string check)
    expect(document.cookie).toContain('mode=wedding');
  });

  it('should set manual mode correctly', () => {
    const { result } = renderHook(() => useMode());

    act(() => {
      result.current.setMode('production');
    });

    expect(result.current.mode).toBe('production');
    expect(document.cookie).toContain('mode=production');
  });
});
