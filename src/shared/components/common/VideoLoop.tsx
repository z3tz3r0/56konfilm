'use client';

import { useDeviceTier } from '@shared/hooks';
import { cn } from '@shared/utils/styling/tailwindUtils';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface VideoLoopProps {
  url: string;
  mimeType?: string;
  posterUrl?: string;
  className?: string;
  priority?: boolean;
  enableObserver?: boolean;
}

/**
 * Shows a poster until device initialization permits autoplay, then mounts
 * looping playback.
 */
export default function VideoLoop(props: VideoLoopProps) {
  const { posterUrl, className, priority = false } = props;
  const { allowVideoAutoplay, isInitialized } = useDeviceTier();

  // Keep first paint conservative until client capability detection completes.
  const shouldAutoplay = isInitialized && allowVideoAutoplay;

  // For low-power devices: render poster-first experience (no video at all)
  if (!shouldAutoplay) {
    return (
      <div className={cn('relative h-full w-full overflow-hidden', className)}>
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt='Video poster'
            fill
            priority={priority}
            sizes='100vw'
            className='object-cover'
            data-testid='video-poster-fallback'
          />
        ) : (
          <div
            className='absolute inset-0 bg-neutral-900'
            data-testid='video-placeholder-fallback'
          />
        )}
      </div>
    );
  }

  return <VideoPlayback {...props} />;
}

/** Remount playback state with the video, not with the capability fallback. */
function VideoPlayback({
  url,
  mimeType,
  posterUrl,
  className,
  priority = false,
  enableObserver = true,
}: VideoLoopProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = enableObserver
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                video.play().catch(() => {
                  // Auto-play was prevented.
                });
              } else {
                video.pause();
              }
            });
          },
          { threshold: 0.1 }
        )
      : undefined;
    observer?.observe(video);

    return () => {
      observer?.disconnect();
      video.pause();
    };
  }, [enableObserver]);

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt='Video poster'
          fill
          priority={priority}
          sizes='100vw'
          className={cn(
            'object-cover transition-opacity duration-700',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
        />
      ) : null}
      <video
        ref={videoRef}
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        autoPlay
        muted
        loop
        playsInline
        preload={priority ? 'auto' : 'metadata'}
        onCanPlay={() => setIsLoaded(true)}
        data-testid='video-loop'
      >
        <source src={url} type={mimeType ?? 'video/mp4'} />
      </video>
    </div>
  );
}
