'use client';

import { useDeviceTier } from '@shared/hooks';
import { cn } from '@shared/utils/styling/tailwindUtils';
import { useInView } from 'motion/react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

interface VideoItemProps {
  src: string;
  className?: string;
  posterUrl?: string;
}

/**
 * Renders viewport-controlled video or a poster fallback when the initialized
 * policy disallows autoplay.
 */
export default function VideoItem({
  src,
  className,
  posterUrl,
}: VideoItemProps) {
  const { allowVideoAutoplay, isInitialized } = useDeviceTier();

  // For low-power devices: render poster or placeholder instead of video
  if (isInitialized && !allowVideoAutoplay) {
    return (
      <div
        className={cn('relative h-full w-full', className)}
        data-testid='video-item-fallback'
      >
        {posterUrl ? (
          <Image
            src={posterUrl}
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
      src={src}
      className={className}
      posterUrl={posterUrl}
      allowVideoAutoplay={allowVideoAutoplay}
    />
  );
}

/** Keep the viewport observer attached to the currently mounted video element. */
function GalleryVideo({
  src,
  className,
  posterUrl,
  allowVideoAutoplay,
}: VideoItemProps & { allowVideoAutoplay: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { margin: '0px 0px -10% 0px' });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView && allowVideoAutoplay) {
      video.play().catch(() => {
        // Auto-play can be blocked by browser policy; ignore silently.
      });
    } else {
      video.pause();
    }

    return () => video.pause();
  }, [isInView, allowVideoAutoplay]);

  return (
    <video
      ref={videoRef}
      src={src}
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
