import { urlFor } from '@/sanity/lib/image';
import { PortableText, PortableTextComponents } from 'next-sanity';
import Image from 'next/image';
import { ComponentProps } from 'react';

interface PortableTextRendererProps {
  value: ComponentProps<typeof PortableText>['value'];
}

export default function PortableTextRenderer({
  value,
}: PortableTextRendererProps) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className='prose dark:prose-invert prose-p:text-text-secondary max-w-none py-8'>
      <PortableText value={value} components={components} />
    </div>
  );
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }) =>
      value ? (
        <div className='not-prose relative aspect-video w-full overflow-hidden rounded-2xl'>
          <Image
            src={urlFor(value).width(1200).fit('max').auto('format').url()}
            alt={value.alt || 'Project Illustration'}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw'
          />
        </div>
      ) : null,
  },
};
