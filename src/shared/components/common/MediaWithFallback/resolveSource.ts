import type { ImageProps } from 'next/image';
import type { MediaSource, ResolvedMediaSource } from './types';

/** Normalize public sources without knowing anything about the CMS. */
export function resolveSource<T extends ImageProps['src']>(
  source: MediaSource<T>
): ResolvedMediaSource<T> {
  if (
    source === null ||
    source === undefined ||
    (typeof source === 'string' && !source.trim())
  ) {
    return { status: 'source-missing', key: 'source-missing' };
  }
  if (typeof source === 'object' && 'error' in source) {
    return { status: 'error', key: 'error' };
  }
  const data: ImageProps['src'] = source;
  const url =
    typeof data === 'string'
      ? data
      : 'default' in data
        ? data.default.src
        : data.src;
  return { status: 'loading', src: source, key: url };
}
