import type { ComponentProps, ReactNode } from 'react';

// Only unrelated shell/image integrations are replaced; hook and Motion stay real.
export function SectionShell({ children }: { children: ReactNode }) {
  return <section>{children}</section>;
}
export function SectionHeader() {
  return null;
}
export default function FixtureImage({
  fill: _fill,
  priority: _priority,
  alt = '',
  ...props
}: ComponentProps<'img'> & { fill?: boolean; priority?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element -- Offline stand-in for next/image.
  return <img {...props} alt={alt} />;
}
