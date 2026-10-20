import type { Locale } from '@shared/config/preferences';
import { cn } from '@shared/utils/styling/tailwindUtils';
import type { MediaStatus } from './types';

interface MediaPlaceholderProps {
  status: Exclude<MediaStatus, 'success'>;
  mediaType: 'image' | 'video';
  lang: Locale;
  className?: string;
}

const messages = {
  en: {
    image: {
      'source-missing': 'No Image',
      loading: 'Loading image…',
      error: 'Unable to load image',
    },
    video: {
      'source-missing': 'No Video',
      loading: 'Loading video…',
      error: 'Unable to load video',
    },
  },
  th: {
    image: {
      'source-missing': 'ไม่มีรูปภาพ',
      loading: 'กำลังโหลดรูปภาพ…',
      error: 'ไม่สามารถโหลดรูปภาพได้',
    },
    video: {
      'source-missing': 'ไม่มีวิดีโอ',
      loading: 'กำลังโหลดวิดีโอ…',
      error: 'ไม่สามารถโหลดวิดีโอได้',
    },
  },
} as const;

export default function MediaPlaceholder({
  status,
  mediaType,
  lang,
  className,
}: MediaPlaceholderProps) {
  const message = messages[lang][mediaType][status];
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden p-2 text-center text-sm',
        className
      )}
      role='status'
      data-slot='media-placeholder'
      data-media-status={status}
    >
      <div
        aria-hidden='true'
        className={cn(
          'bg-off-white absolute inset-0',
          status === 'loading' && 'motion-safe:animate-pulse'
        )}
        data-slot='media-loading-surface'
      />
      <span
        className={cn(
          'text-midnight-black relative',
          status === 'loading' && 'sr-only motion-reduce:not-sr-only'
        )}
      >
        {message}
      </span>
    </div>
  );
}
