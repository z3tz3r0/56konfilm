import { cn } from '@/lib/utils';
import { useInView } from 'motion/react';
import { useEffect, useRef } from 'react';

interface VideoItemProps {
  src: string;
  className?: string;
}

export function VideoItem({ src, className }: VideoItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // useInView hook to detect visibility. Trigger slightly before entering/leaving
  // using ref on the video element itself.
  const isInView = useInView(videoRef, { margin: "0px 0px -10% 0px" }); // Wait until 10% visible from bottom? Or just margin.
  // Actually standard IntersectionObserver margin might be better: "0px"
  // Let's stick to default or slight offset?
  // User wanted "ONLY play when in the viewport".

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView) {
      video.play().catch((err) => {
        console.warn('Video auto-play failed:', err);
      });
    } else {
      video.pause();
    }
  }, [isInView]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={cn('w-full h-full object-cover block', className)}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
