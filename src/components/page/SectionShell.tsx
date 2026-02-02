import Image from 'next/image';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { urlFor } from '@/sanity/lib/image';
import { BackgroundMediaItem } from '@/types/sanity';
import VideoLoop from './sections/hero/VideoLoop';

const backgroundVariants: Record<string, string> = {
  default: '',
  muted: 'bg-secondary',
  contrast: 'bg-primary text-primary-foreground',
};

interface SectionShellProps {
  background?: string;
  media?: BackgroundMediaItem[] | null;
  sanityType?: string;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  disablePadding?: boolean;
  className?: string;
  children: ReactNode;
  videoPriority?: boolean; // Hero should use true, others false
  enableVideoObserver?: boolean; // Enable IntersectionObserver for non-hero sections
}

export default function SectionShell({
  background,
  media,
  sanityType,
  overlayClassName,
  overlayStyle,
  disablePadding = false,
  className,
  children,
  videoPriority = false,
  enableVideoObserver = false,
}: SectionShellProps) {
  const backgroundClass =
    backgroundVariants[background ?? 'default'] ?? backgroundVariants.default;
  const paddingClass = disablePadding ? '' : 'px-4 py-16 md:p-24';
  const videoAsset = media?.find((item) => item.mimeType?.startsWith('video'));
  const imageAsset = media?.find((item) => item.image);

  const posterUrl = imageAsset?.image
    ? urlFor(imageAsset.image)
        .width(1920)
        .height(1080)
        .quality(75)
        .fit('clip')
        .url()
    : undefined;

  const shouldRenderMedia = Boolean(videoAsset?.url || posterUrl);

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden w-full',
        paddingClass,
        backgroundClass,
        className
      )}
      data-sanity-type={sanityType}
    >
      <div className="relative z-10">{children}</div>

      {shouldRenderMedia ? (
        <div className="absolute inset-0 -z-10">
          {videoAsset?.url ? (
            <VideoLoop
              url={videoAsset.url}
              mimeType={videoAsset.mimeType}
              posterUrl={posterUrl}
              className="absolute inset-0"
              priority={videoPriority}
              enableObserver={enableVideoObserver}
            />
          ) : posterUrl ? (
            <Image
              src={posterUrl}
              alt="Section background"
              fill
              priority={videoPriority}
              className="object-cover"
              sizes="100vw"
            />
          ) : null}
          {overlayClassName || overlayStyle ? (
            <div 
              className={cn('absolute inset-0', overlayClassName)} 
              style={overlayStyle}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
