import { cn } from '@shared/utils/styling/tailwindUtils';
import { PortableText, PortableTextComponents } from 'next-sanity';
import { ComponentProps } from 'react';
import type { Locale } from '@shared/config/preferences';
import PortableTextImage from './PortableTextImage';

interface PortableTextRendererProps {
  lang: Locale;
  value: ComponentProps<typeof PortableText>['value'];
  className?: string;
}

/** Render nonempty Portable Text content with localized image fallbacks and prose styling. */
export default function PortableTextRenderer({
  value,
  lang,
  className,
}: PortableTextRendererProps) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const components: PortableTextComponents = {
    types: {
      image: ({ value }) => <PortableTextImage value={value} lang={lang} />,
    },
  };
  return (
    <div
      className={cn(
        'prose dark:prose-invert prose-p:text-text-secondary max-w-none py-8',
        className
      )}
    >
      <PortableText value={value} components={components} />
    </div>
  );
}
