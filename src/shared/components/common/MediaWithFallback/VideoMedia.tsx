'use client';

import { useCallback, useState } from 'react';
import { cn } from '@shared/utils/styling/tailwindUtils';
import ImageMedia from './ImageMedia';
import MediaPlaceholder from './MediaPlaceholder';
import { resolveSource } from './resolveSource';
import { attachRef } from './attachRef';
import type {
  MediaStatus,
  ResolvedMediaSource,
  VideoMediaProps,
} from './types';

type Props = Omit<VideoMediaProps, 'source'> & {
  resolvedSource: ResolvedMediaSource<string>;
};

export default function VideoMedia({
  mediaType,
  resolvedSource,
  lang,
  containerClassName,
  ref,
  mimeType,
  poster,
  posterAlt = '',
  className,
  onCanPlay,
  onError,
  ...videoProps
}: Props) {
  const [status, setStatus] = useState<MediaStatus>(resolvedSource.status);
  const videoRef = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video) return;
      const cleanup = attachRef(ref, video);
      if (video.error) setStatus('error');
      else if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        setStatus('success');
      }
      // Resource selection briefly starts at NETWORK_NO_SOURCE on healthy mounts.
      // Check in the next task to also recover source errors missed before hydration.
      const selectionCheck = window.setTimeout(() => {
        if (
          video.error ||
          (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE &&
            video.readyState === HTMLMediaElement.HAVE_NOTHING)
        ) {
          setStatus('error');
        }
      }, 0);
      return () => {
        window.clearTimeout(selectionCheck);
        cleanup?.();
      };
    },
    [ref]
  );
  const posterSource = resolveSource(poster);
  const src = resolvedSource.status === 'loading' ? resolvedSource.src : null;

  return (
    <div
      className={cn('relative isolate size-full', containerClassName)}
      data-slot='media-with-fallback'
      data-media-status={status}
    >
      {src && status === 'loading' && poster && (
        // Keep the poster above video feedback; a failed poster exposes that feedback.
        <div
          className='pointer-events-none absolute inset-0 z-3'
          aria-hidden='true'
        >
          <ImageMedia
            key={posterSource.key}
            mediaType='image'
            resolvedSource={posterSource}
            lang={lang}
            alt={posterAlt}
            fill
            sizes='100vw'
            className='object-cover'
            hideFailure
          />
        </div>
      )}
      {src && (
        <video
          {...videoProps}
          poster={poster}
          ref={videoRef}
          aria-busy={status === 'loading'}
          aria-hidden={status === 'error' ? true : videoProps['aria-hidden']}
          className={cn(
            'relative z-1 block size-full object-cover',
            className,
            status === 'error' && 'invisible'
          )}
          onCanPlay={(event) => {
            setStatus('success');
            onCanPlay?.(event);
          }}
          onError={(event) => {
            setStatus('error');
            onError?.(event);
          }}
        >
          <source
            src={src}
            type={mimeType}
            onError={() => setStatus('error')}
          />
        </video>
      )}
      {status !== 'success' && (
        <MediaPlaceholder
          className='z-2'
          status={status}
          mediaType={mediaType}
          lang={lang}
        />
      )}
    </div>
  );
}
