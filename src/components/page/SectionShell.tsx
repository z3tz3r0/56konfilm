import Image from 'next/image';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { urlFor } from '@/sanity/lib/image';
import { BackgroundMediaItem } from '@/types/sanity';

const backgroundVariants: Record<string, string> = {
  default: '',
  muted: 'bg-muted/40 dark:bg-muted/10',
  contrast: 'bg-primary text-primary-foreground',
};

interface SectionShellProps {
  background?: string;
  media?: BackgroundMediaItem[] | null;
  overlayClassName?: string;
  disablePadding?: boolean;
  className?: string;
  children: ReactNode;
}

export default function SectionShell({
  background,
  media,
  overlayClassName,
  disablePadding = false,
  className,
  children,
}: SectionShellProps) {
  const backgroundClass =
    backgroundVariants[background ?? 'default'] ?? backgroundVariants.default;
  const paddingClass = disablePadding ? '' : 'p-4 md:p-24';
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
        'relative isolate h-screen overflow-hidden',
        paddingClass,
        backgroundClass,
        className
      )}
    >
      <div className="relative z-10">{children}</div>

      {shouldRenderMedia ? (
        <div className="absolute inset-0 -z-10">
          {videoAsset?.url ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              playsInline
              muted
              loop
              preload="auto"
              poster={posterUrl}
            >
              <source
                src={videoAsset.url}
                type={videoAsset.mimeType ?? 'video/mp4'}
              />
            </video>
          ) : null}
          {!videoAsset?.url && posterUrl ? (
            <Image
              src={posterUrl}
              alt="Section background"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : null}
          {overlayClassName ? (
            <div className={cn('absolute inset-0', overlayClassName)} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
