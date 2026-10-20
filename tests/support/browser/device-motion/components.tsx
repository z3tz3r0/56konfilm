import type { ComponentProps, ReactNode } from 'react';

export { default as MediaWithFallback } from '@shared/components/common/MediaWithFallback';

// Only unrelated shell/image integrations are replaced; hook and Motion stay real.
/**
 * Provides a plain section wrapper for the offline device-motion fixture.
 */
export function SectionShell({ children }: { children: ReactNode }) {
  return <section>{children}</section>;
}
/**
 * Omits section headings from the offline device-motion fixture.
 */
export function SectionHeader() {
  return null;
}
/**
 * Renders a native image for the offline fixture, discarding Next.js-only image
 * props.
 */
export default function FixtureImage({
  fill: _fill,
  priority: _priority,
  alt = '',
  ...props
}: ComponentProps<'img'> & { fill?: boolean; priority?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element -- Offline stand-in for next/image.
  return <img {...props} alt={alt} />;
}
