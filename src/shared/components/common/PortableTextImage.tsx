import { getImageSource } from '@/sanity/lib/image';
import type { Locale } from '@shared/config/preferences';
import type { ImageSource } from '@shared/types/sanity';
import MediaWithFallback from './MediaWithFallback';

interface PortableTextImageProps {
  value: ImageSource & { alt?: string };
  lang: Locale;
}

/** Adapt a raw Portable Text image node without changing the CMS projection. */
export default function PortableTextImage({
  value,
  lang,
}: PortableTextImageProps) {
  if (!value) return null;
  const image =
    typeof value === 'object' && 'asset' in value ? value : undefined;
  return (
    <div className='not-prose relative aspect-video w-full overflow-hidden rounded-2xl'>
      <MediaWithFallback
        mediaType='image'
        source={getImageSource(image, {
          width: 1200,
          fit: 'max',
          auto: 'format',
        })}
        lang={lang}
        alt={value.alt || 'Project Illustration'}
        fill
        className='object-cover'
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw'
      />
    </div>
  );
}
