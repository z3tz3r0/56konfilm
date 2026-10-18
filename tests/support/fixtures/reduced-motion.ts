import { vi } from 'vitest';

/** A controllable browser preference; application hooks and classifiers stay real. */
export function mockReducedMotion(initial = false) {
  let matches = initial;
  const target = new EventTarget();
  const listeners = new Set<EventListenerOrEventListenerObject>();
  const query = '(prefers-reduced-motion: reduce)';
  const media = {
    get matches() {
      return matches;
    },
    media: query,
    onchange: null,
    addEventListener: vi.fn(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'change') listeners.add(listener);
        target.addEventListener(type, listener);
      }
    ),
    removeEventListener: vi.fn(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'change') listeners.delete(listener);
        target.removeEventListener(type, listener);
      }
    ),
    dispatchEvent: (event: Event) => target.dispatchEvent(event),
  } as unknown as MediaQueryList;
  const matchMedia = vi.fn((value: string) =>
    value === query ? media : { ...media, matches: false, media: value }
  );
  vi.stubGlobal('matchMedia', matchMedia);

  return {
    media,
    matchMedia,
    listenerCount: () => listeners.size,
    set(reduced: boolean) {
      matches = reduced;
      target.dispatchEvent(new Event('change'));
    },
  };
}
