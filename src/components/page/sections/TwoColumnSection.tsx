import Image from 'next/image';

import CtaGroup from '@/components/page/CtaGroup';
import SectionShell from '@/components/page/SectionShell';
import { getAlignmentClass } from '@/components/page/utils';
import { cn } from '@/lib/utils';
import { urlFor } from '@/sanity/lib/image';
import { TwoColumnSectionBlock } from '@/types/sanity';

interface TwoColumnSectionProps {
  block: TwoColumnSectionBlock;
}

export default function TwoColumnSection({ block }: TwoColumnSectionProps) {
  const isTextLeft = block.layout !== 'textRight';
  const textColumnOrder = isTextLeft ? 'md:order-1' : 'md:order-2';
  const mediaColumnOrder = isTextLeft ? 'md:order-2' : 'md:order-1';
  const alignClass = getAlignmentClass(block.content?.align);

  return (
    <SectionShell background={block.background}>
      <div className="container mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
        <div
          className={cn(
            'order-1 flex flex-col gap-6',
            textColumnOrder,
            alignClass
          )}
        >
          {block.content?.eyebrow ? (
            <span className="text-primary text-xl font-black tracking-[0.2em] wrap-break-word uppercase md:text-2xl">
              {block.content.eyebrow}
            </span>
          ) : null}
          {block.content?.heading ? (
            <h2 className="text-3xl tracking-tight text-balance md:text-4xl">
              {block.content.heading}
            </h2>
          ) : null}
          {block.content?.body ? (
            <p className="text-muted-foreground text-base leading-relaxed text-pretty wrap-break-word">
              {block.content.body}
            </p>
          ) : null}
          <CtaGroup
            ctas={block.ctas}
            alignment={block.content?.align}
            className="md:max-w-xs"
            fullWidth
          />
        </div>
        {block.media?.image ? (
          <div className={cn('order-2 min-w-0', mediaColumnOrder)}>
            <div className="bg-muted relative aspect-square overflow-hidden rounded-2xl md:aspect-auto md:h-full">
              <Image
                src={urlFor(block.media.image).quality(80).fit('clip').url()}
                alt={block.media.alt ?? ''}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
