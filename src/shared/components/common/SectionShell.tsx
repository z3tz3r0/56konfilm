import Image from 'next/image';
import { ReactNode } from 'react';
import { cn } from '@shared/utils';
import { urlFor } from '@/sanity/lib/image';
import { BackgroundMediaItem } from '@shared/types';
import { VideoLoop } from '@shared/components';

const backgroundVariants: Record<string, string> = {
  default: '',
  muted: 'bg-secondary',
  contrast: 'bg-primary text-primary-foreground',
};

interface SectionShellProps {
  background?: string;
  media?: BackgroundMediaItem[] | null;
  sanityType?: string;
  dataTestId?: string;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  disablePadding?: boolean;
  className?: string;
  children: ReactNode;
  videoPriority?: boolean; // Hero should use true, others false
  enableVideoObserver?: boolean; // Enable IntersectionObserver for non-hero sections
  shapeDivider?: boolean;
}

export default function SectionShell({
  background,
  media,
  sanityType,
  dataTestId,
  overlayClassName,
  overlayStyle,
  disablePadding = false,
  className,
  children,
  videoPriority = false,
  enableVideoObserver = false,
  shapeDivider = false,
}: SectionShellProps) {
  const backgroundClass =
    backgroundVariants[background ?? 'default'] ?? backgroundVariants.default;
  const paddingClass = disablePadding ? '' : 'px-14 py-16 md:px-24';
  const videoAsset = media?.find((item) => item.mimeType?.startsWith('video'));
  const imageAsset = media?.find(
    (item) => item.image || (item.url && !item.mimeType?.startsWith('video'))
  );

  const posterUrl = imageAsset?.image
    ? urlFor(imageAsset.image)
        .width(1920)
        .height(1080)
        .quality(75)
        .fit('clip')
        .url()
    : (imageAsset?.url ?? undefined);

  const shouldRenderMedia = Boolean(videoAsset?.url || posterUrl);

  return (
    <section
      className={cn(
        'relative isolate w-full overflow-hidden',
        paddingClass,
        backgroundClass,
        className
      )}
      data-sanity-type={sanityType}
      data-testid={dataTestId}
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

      {/* Shape Divider */}
      {shapeDivider && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[80px] overflow-hidden"
        >
          <svg
            focusable="false"
            viewBox="0 0 1280 80"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path fill="var(--color-ivory-white)" d="M0,80 Q640 0,1280 80" />
          </svg>
        </div>
      )}
    </section>
  );
}
