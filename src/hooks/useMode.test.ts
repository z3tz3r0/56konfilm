import { useMode, useModeStore } from '@/hooks/useMode';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock next-themes
const mockSetTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
  }),
}));

describe('useMode Hook', () => {
  beforeEach(() => {
    // Reset store and mocks before each test
    act(() => {
      useModeStore.setState({ mode: 'production' });
    });
    mockSetTheme.mockClear();
    
    // Clear cookie (simple mock)
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
    
    // Clear data attributes
    document.documentElement.removeAttribute('data-mode');
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

    // 2. Check Theme sync
    expect(mockSetTheme).toHaveBeenCalledWith('light');

    // 3. Check HTML Attribute
    expect(document.documentElement.getAttribute('data-mode')).toBe('wedding');

    // 4. Check Cookie (basic string check)
    expect(document.cookie).toContain('mode=wedding');
  });

  it('should set manual mode correctly', () => {
    const { result } = renderHook(() => useMode());

    act(() => {
      result.current.setMode('production');
    });

    expect(result.current.mode).toBe('production');
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    expect(document.documentElement.getAttribute('data-mode')).toBe('production');
    expect(document.cookie).toContain('mode=production');
  });
});
