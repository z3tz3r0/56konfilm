import type { Ref } from 'react';

/** Forward the DOM node to a consumer ref and preserve its cleanup. */
export function attachRef<T>(ref: Ref<T> | undefined, node: T) {
  if (typeof ref === 'function') {
    const cleanup = ref(node);
    return () => {
      if (typeof cleanup === 'function') cleanup();
      else ref(null);
    };
  }
  if (ref) {
    ref.current = node;
    return () => {
      ref.current = null;
    };
  }
}
