import { cn } from '@shared/utils/styling/tailwindUtils';
import { DEFAULT_LOCALE, type Locale } from '@shared/config';
import MediaWithFallback from './MediaWithFallback';
import type { MediaSource } from './MediaWithFallback/types';

interface ImageWithFrameProps extends React.ComponentPropsWithoutRef<'section'> {
  src?: MediaSource<string>;
  lang?: Locale;
  alt: string;
  imageAspectRatio?: string;
  sizes?: string;
}

/**
 * Renders a framed image or placeholder with responsive image sizes.
 * An explicit aspect ratio sizes the inner frame; otherwise the legacy frame
 * dimensions are used.
 */
export default function ImageWithFrame({
  src,
  lang = DEFAULT_LOCALE,
  alt,
  imageAspectRatio,
  sizes = '(min-width: 768px) 50vw, 100vw',
  className,
  ...props
}: ImageWithFrameProps) {
  return (
    <section
      lang={lang}
      className={cn(
        'bg-neutral relative shadow-md',
        imageAspectRatio
          ? 'w-full p-4'
          : 'aspect-600/433 max-h-[433px] max-w-[600px]',
        className
      )}
      {...props}
    >
      <div
        className={imageAspectRatio ? 'relative w-full' : 'absolute inset-4'}
        style={imageAspectRatio ? { aspectRatio: imageAspectRatio } : undefined}
      >
        <MediaWithFallback
          mediaType='image'
          source={src}
          lang={lang}
          alt={alt}
          fill
          className='object-cover'
          sizes={sizes}
        />
      </div>
    </section>
  );
}
