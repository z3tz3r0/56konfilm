import Image from 'next/image';
import { cn } from '@shared/utils';

interface ImageWithFrameProps extends React.ComponentPropsWithoutRef<'section'> {
  src: string;
  alt: string;
}

export default function ImageWithFrame({
  src,
  alt,
  className,
  ...props
}: ImageWithFrameProps) {
  return (
    <section
      className={cn(
        'relative aspect-600/433 max-w-[600px] bg-white shadow-md',
        className
      )}
      {...props}
    >
      <div className="absolute inset-4">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>
    </section>
  );
}
