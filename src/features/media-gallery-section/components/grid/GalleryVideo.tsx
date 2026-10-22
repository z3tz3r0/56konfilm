'use client';

import { useInView } from 'motion/react';
import { useEffect, useRef } from 'react';
import type { Locale } from '@shared/config/preferences';
import { cn } from '@shared/utils/styling/tailwindUtils';
import MediaWithFallback from '@shared/components/common/MediaWithFallback';

interface GalleryVideoProps {
  src: string;
  lang: Locale;
  className?: string;
  posterUrl?: string;
  allowVideoAutoplay: boolean;
}

/** Own the viewport observer and playback lifecycle for one video source. */
export default function GalleryVideo({
  src,
  lang,
  className,
  posterUrl,
  allowVideoAutoplay,
}: GalleryVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { margin: '0px 0px -10% 0px' });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isInView && allowVideoAutoplay) {
      video.play().catch(() => {
        // A rejected autoplay request is not a media loading failure.
      });
    } else {
      video.pause();
    }
    return () => video.pause();
  }, [isInView, allowVideoAutoplay]);

  return (
    <MediaWithFallback
      mediaType='video'
      source={src}
      lang={lang}
      ref={videoRef}
      poster={posterUrl}
      className={cn('block h-full w-full object-cover', className)}
      autoPlay={allowVideoAutoplay}
      muted
      loop
      playsInline
      preload='metadata'
      data-testid='video-item'
    />
  );
}
