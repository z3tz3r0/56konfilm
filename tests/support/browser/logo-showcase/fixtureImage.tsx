import type { ComponentProps, CSSProperties } from 'react';

/** Match next/image's fill geometry without any network requests or optimizer. */
export default function FixtureImage({
  fill,
  style,
  ...props
}: ComponentProps<'img'> & { fill?: boolean }) {
  const fillStyle: CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
    : {};
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Offline next/image stand-in.
    <img {...props} alt={props.alt ?? ''} style={{ ...fillStyle, ...style }} />
  );
}
