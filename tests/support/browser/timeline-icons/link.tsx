import type { ComponentProps } from 'react';

/** Render fixture links as anchors without the Next.js router integration. */
export default function Link(props: ComponentProps<'a'>) {
  return <a {...props} />;
}
