'use client';

import { useDeviceTier } from '@shared/hooks';
import { cn } from '@shared/utils/styling/tailwindUtils';
import type { Locale } from '@shared/config';
import { MediaWithFallback } from '@shared/components';
import GalleryVideo from './GalleryVideo';

interface VideoItemProps {
  src?: string | null;
  lang: Locale;
  className?: string;
  posterUrl?: string;
}

/**
 * Renders viewport-controlled video or a poster fallback when the initialized
 * policy disallows autoplay.
 */
export default function VideoItem({
  src,
  lang,
  className,
  posterUrl,
}: VideoItemProps) {
  const { allowVideoAutoplay, isInitialized } = useDeviceTier();

  if (src === null || src === undefined || !src.trim()) {
    return (
      <MediaWithFallback
        mediaType='video'
        source={src}
        lang={lang}
        containerClassName={className}
      />
    );
  }

  // For low-power devices: render poster or placeholder instead of video
  if (isInitialized && !allowVideoAutoplay) {
    return (
      <div
        className={cn('relative h-full w-full', className)}
        data-testid='video-item-fallback'
      >
        {posterUrl ? (
          <MediaWithFallback
            mediaType='image'
            source={posterUrl}
            lang={lang}
            alt='Video thumbnail'
            fill
            sizes='100vw'
            className='object-cover'
          />
        ) : (
          <div className='h-full w-full bg-neutral-800' />
        )}
      </div>
    );
  }

  return (
    <GalleryVideo
      key={src}
      src={src}
      lang={lang}
      className={className}
      posterUrl={posterUrl}
      allowVideoAutoplay={allowVideoAutoplay}
    />
  );
}
