'use client';

import { useDeviceTier } from '@/hooks/useDeviceTier';
import { cn } from '@/lib/utils';
import { useInView } from 'motion/react';
import { useEffect, useRef } from 'react';

interface VideoItemProps {
  src: string;
  className?: string;
  posterUrl?: string;
}

export function VideoItem({ src, className, posterUrl }: VideoItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { allowVideoAutoplay, isInitialized } = useDeviceTier();
  
  // useInView hook to detect visibility
  const isInView = useInView(videoRef, { margin: '0px 0px -10% 0px' });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Only attempt play if device tier allows autoplay
    if (isInView && allowVideoAutoplay) {
      video.play().catch(() => {
        // Auto-play can be blocked by browser policy; ignore silently.
      });
    } else {
      video.pause();
    }
  }, [isInView, allowVideoAutoplay]);

  // For low-power devices: render poster or placeholder instead of video
  if (isInitialized && !allowVideoAutoplay) {
    return (
      <div 
        className={cn('w-full h-full relative', className)}
        data-testid="video-item-fallback"
      >
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover block"
          />
        ) : (
          <div className="w-full h-full bg-neutral-800" />
        )}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      poster={posterUrl}
      className={cn('w-full h-full object-cover block', className)}
      autoPlay={allowVideoAutoplay}
      muted
      loop
      playsInline
      preload="metadata"
      data-testid="video-item"
    />
  );
}
