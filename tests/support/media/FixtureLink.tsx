import type { ComponentProps } from 'react';

/** Render a native anchor as the test replacement for Next.js Link. */
export default function FixtureLink(props: ComponentProps<'a'>) {
  return <a {...props} />;
}
