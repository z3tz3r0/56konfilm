'use client';

import { cn } from '@/lib/utils';
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

export default function VideoLoop({ 
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
    if (!video || !enableObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Auto-play was prevented
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, [enableObserver]);

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt="Video poster"
          fill
          priority={priority}
          sizes="100vw"
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
      >
        <source src={url} type={mimeType ?? 'video/mp4'} />
      </video>
    </div>
  );
}
