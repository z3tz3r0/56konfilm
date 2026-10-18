import { act, cleanup, render, renderHook } from '@testing-library/react';
import { createElement, StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeviceTier } from '@shared/hooks/useDeviceTier';
import { mockReducedMotion } from '../support/fixtures/reduced-motion';

let motion: ReturnType<typeof mockReducedMotion>;

beforeEach(() => {
  motion = mockReducedMotion();
  vi.stubGlobal('navigator', {
    hardwareConcurrency: 8,
    connection: { saveData: false },
  });
});

afterEach(() => {
  cleanup();
  expect(motion.listenerCount()).toBe(0);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useDeviceTier', () => {
  it('returns the existing flags plus the independent preference', () => {
    const { result } = renderHook(useDeviceTier);
    expect(result.current).toEqual({
      tier: 'high',
      isLowPower: false,
      allowHeavyMotion: true,
      allowVideoAutoplay: true,
      useSimplifiedTransitions: false,
      prefersReducedMotion: false,
      isInitialized: true,
    });
  });

  it.each([false, true])(
    'reacts in both directions starting with reduce=%s',
    (initial) => {
      motion.set(initial);
      const { result } = renderHook(useDeviceTier);
      expect(result.current.prefersReducedMotion).toBe(initial);
      expect(result.current.allowHeavyMotion).toBe(!initial);

      for (const reduced of [!initial, initial, !initial]) {
        act(() => motion.set(reduced));
        expect(result.current.prefersReducedMotion).toBe(reduced);
        expect(result.current.tier).toBe(reduced ? 'low' : 'high');
        expect(result.current.allowHeavyMotion).toBe(!reduced);
        expect(result.current.allowVideoAutoplay).toBe(!reduced);
      }
    }
  );

  it.each([
    { hardwareConcurrency: 2, saveData: false },
    { hardwareConcurrency: 8, saveData: true },
  ])(
    'keeps low-tier safeguards after reduction is disabled: %j',
    (capabilities) => {
      vi.stubGlobal('navigator', {
        hardwareConcurrency: capabilities.hardwareConcurrency,
        connection: { saveData: capabilities.saveData },
      });
      motion.set(true);
      const { result } = renderHook(useDeviceTier);
      const previous = result.current;
      act(() => motion.set(false));
      expect(result.current).not.toBe(previous);
      expect(result.current).toMatchObject({
        tier: 'low',
        prefersReducedMotion: false,
        allowHeavyMotion: false,
        allowVideoAutoplay: false,
      });
    }
  );

  it('restores medium-tier flags without promoting the hardware to high', () => {
    vi.stubGlobal('navigator', { hardwareConcurrency: 4 });
    motion.set(true);
    const { result } = renderHook(useDeviceTier);
    act(() => motion.set(false));
    expect(result.current.tier).toBe('medium');
    expect(result.current.allowHeavyMotion).toBe(true);
  });

  it('shares a snapshot and one subscription until the last consumer unmounts', () => {
    const first = renderHook(useDeviceTier);
    const second = renderHook(useDeviceTier);
    expect(first.result.current).toBe(second.result.current);
    expect(motion.listenerCount()).toBe(1);
    expect(motion.media.addEventListener).toHaveBeenCalledTimes(1);
    first.unmount();
    expect(motion.media.removeEventListener).not.toHaveBeenCalled();
    act(() => motion.set(true));
    expect(second.result.current.prefersReducedMotion).toBe(true);
    second.unmount();
    expect(motion.media.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('retains snapshot identity and does not rerender for unchanged events', () => {
    const renders = vi.fn();
    const { result, rerender } = renderHook(() => {
      renders();
      return useDeviceTier();
    });
    const previous = result.current;
    const count = renders.mock.calls.length;
    act(() => motion.set(false));
    expect(renders).toHaveBeenCalledTimes(count);
    expect(result.current).toBe(previous);
    rerender();
    expect(result.current).toBe(previous);
    expect(motion.media.addEventListener).toHaveBeenCalledTimes(1);
  });

  it('refreshes stale state after preference changes without mounted consumers', () => {
    const first = renderHook(useDeviceTier);
    expect(first.result.current.prefersReducedMotion).toBe(false);
    first.unmount();
    motion.set(true);
    const second = renderHook(useDeviceTier);
    expect(second.result.current.prefersReducedMotion).toBe(true);
    expect(second.result.current.allowHeavyMotion).toBe(false);
  });

  it('handles a preference change between reading and subscribing', () => {
    vi.mocked(motion.media.addEventListener).mockImplementationOnce(() =>
      motion.set(true)
    );
    const { result } = renderHook(useDeviceTier);
    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.allowHeavyMotion).toBe(false);
  });

  it('subscribes and cleans up correctly under Strict Mode', () => {
    const { result, unmount } = renderHook(useDeviceTier, {
      wrapper: ({ children }) => createElement(StrictMode, null, children),
    });
    expect(motion.listenerCount()).toBe(1);
    act(() => motion.set(true));
    expect(result.current.prefersReducedMotion).toBe(true);
    unmount();
    expect(motion.listenerCount()).toBe(0);
    expect(motion.media.addEventListener).toHaveBeenCalledTimes(
      vi.mocked(motion.media.removeEventListener).mock.calls.length
    );
  });

  it('uses a stable conservative server snapshot without reading browser APIs', () => {
    const snapshots: ReturnType<typeof useDeviceTier>[] = [];
    /**
     * Captures server-rendered snapshots for identity and policy assertions.
     */
    function Probe() {
      const value = useDeviceTier();
      snapshots.push(value);
      return createElement('output', null, JSON.stringify(value));
    }
    const markup = renderToString(createElement(Probe));
    renderToString(createElement(Probe));
    expect(snapshots[0]).toBe(snapshots[1]);
    expect(snapshots[0]).toMatchObject({
      tier: 'low',
      allowHeavyMotion: false,
      allowVideoAutoplay: false,
      prefersReducedMotion: false,
      isInitialized: false,
    });
    expect(motion.matchMedia).not.toHaveBeenCalled();
    expect(markup).toContain('isInitialized');
  });

  it.each([false, true])(
    'hydrates safely and then resolves reduced motion=%s',
    async (reduced) => {
      motion.set(reduced);
      const snapshots: ReturnType<typeof useDeviceTier>[] = [];
      /**
       * Captures device snapshots across server rendering and client hydration.
       */
      function Probe() {
        const value = useDeviceTier();
        snapshots.push(value);
        return createElement('output', null, JSON.stringify(value));
      }
      const container = document.createElement('div');
      container.innerHTML = renderToString(createElement(Probe));
      document.body.append(container);
      const errors = vi.spyOn(console, 'error');
      await act(async () => {
        render(createElement(Probe), { container, hydrate: true });
      });
      expect(snapshots[1].isInitialized).toBe(false);
      expect(snapshots.at(-1)).toMatchObject({
        isInitialized: true,
        prefersReducedMotion: reduced,
        allowHeavyMotion: !reduced,
      });
      expect(errors).not.toHaveBeenCalled();
    }
  );

  it('works without matchMedia or connection APIs', () => {
    vi.stubGlobal('matchMedia', undefined);
    vi.stubGlobal('navigator', { hardwareConcurrency: 8 });
    const { result } = renderHook(useDeviceTier);
    expect(result.current.tier).toBe('high');
    expect(result.current.prefersReducedMotion).toBe(false);
  });

  it('handles a media-query implementation without event subscription', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { result, unmount } = renderHook(useDeviceTier);
    expect(result.current.prefersReducedMotion).toBe(true);
    expect(() => unmount()).not.toThrow();
  });
});
