import type { ImageProps } from 'next/image';

/** Offline next/image leaf with real DOM events, refs, and fill geometry. */
export default function FixtureImage({
  src,
  alt,
  fill,
  priority: _priority,
  preload: _preload,
  quality: _quality,
  loader: _loader,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  unoptimized: _unoptimized,
  onLoadingComplete: _onLoadingComplete,
  overrideSrc,
  style,
  ...props
}: ImageProps) {
  const data = typeof src === 'object' && 'default' in src ? src.default : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Test-only optimizer stand-in.
    <img
      {...props}
      alt={alt}
      src={overrideSrc ?? (typeof data === 'string' ? data : data.src)}
      style={{
        ...(fill
          ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
          : {}),
        ...style,
      }}
    />
  );
}
