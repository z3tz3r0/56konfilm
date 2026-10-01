import Image from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@shared/utils/styling/tailwindUtils';

interface ImageWithFrameProps extends React.ComponentPropsWithoutRef<'section'> {
  src?: string;
  alt: string;
  imageAspectRatio?: string;
  sizes?: string;
  placeholder?: ReactNode;
}

export default function ImageWithFrame({
  src,
  alt,
  imageAspectRatio,
  sizes = '(min-width: 768px) 50vw, 100vw',
  placeholder,
  className,
  ...props
}: ImageWithFrameProps) {
  return (
    <section
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
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className='object-cover'
            sizes={sizes}
          />
        ) : (
          <div className='bg-background-secondary text-text-secondary flex size-full items-center justify-center text-sm'>
            {placeholder}
          </div>
        )}
      </div>
    </section>
  );
}
