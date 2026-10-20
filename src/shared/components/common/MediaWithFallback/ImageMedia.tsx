'use client';

import Image, { type ImageProps } from 'next/image';
import { useCallback, useState, type CSSProperties } from 'react';
import { cn } from '@shared/utils/styling/tailwindUtils';
import { attachRef } from './attachRef';
import MediaPlaceholder from './MediaPlaceholder';
import type {
  ImageMediaProps,
  MediaStatus,
  ResolvedMediaSource,
} from './types';

type Props = Omit<ImageMediaProps, 'source'> & {
  resolvedSource: ResolvedMediaSource<ImageProps['src']>;
  /** A failed decorative poster must not report an image error over its video. */
  hideFailure?: boolean;
};

/** Render a Next.js image with localized loading, missing-source, and error feedback.
 * Detect cached loads on attachment and preserve consumer refs and event callbacks. */
export default function ImageMedia({
  mediaType,
  resolvedSource,
  hideFailure = false,
  lang,
  containerClassName,
  alt,
  ref,
  fill,
  width,
  height,
  className,
  onLoad,
  onError,
  ...imageProps
}: Props) {
  const [status, setStatus] = useState<MediaStatus>(resolvedSource.status);
  const imageRef = useCallback(
    (image: HTMLImageElement | null) => {
      if (!image) return;
      const cleanup = attachRef(ref, image);
      if (image.complete) {
        setStatus(image.naturalWidth > 0 ? 'success' : 'error');
      }
      return cleanup;
    },
    [ref]
  );
  const src = resolvedSource.status === 'loading' ? resolvedSource.src : null;
  const staticImage =
    src && typeof src === 'object'
      ? 'default' in src
        ? src.default
        : src
      : null;
  const intrinsicWidth = Number(width ?? staticImage?.width);
  const intrinsicHeight = Number(height ?? staticImage?.height);
  const frameStyle =
    !fill && intrinsicWidth > 0 && intrinsicHeight > 0
      ? ({
          '--media-width': `${intrinsicWidth}px`,
          aspectRatio: `${intrinsicWidth}/${intrinsicHeight}`,
        } as CSSProperties)
      : undefined;

  return (
    <div
      className={cn(
        'isolate',
        fill
          ? 'absolute inset-0'
          : 'relative inline-block max-w-full align-top',
        frameStyle && 'w-(--media-width)',
        containerClassName
      )}
      style={frameStyle}
      data-slot='media-with-fallback'
      data-media-status={status}
    >
      {status !== 'success' && !(hideFailure && status !== 'loading') && (
        <MediaPlaceholder status={status} mediaType={mediaType} lang={lang} />
      )}
      {src && status !== 'error' && (
        <Image
          {...imageProps}
          alt={alt}
          src={src}
          ref={imageRef}
          fill={fill}
          width={width}
          height={height}
          aria-busy={status === 'loading'}
          className={cn('relative z-1 block', !fill && 'size-full', className)}
          onLoad={(event) => {
            setStatus('success');
            onLoad?.(event);
          }}
          onError={(event) => {
            setStatus('error');
            onError?.(event);
          }}
        />
      )}
    </div>
  );
}
