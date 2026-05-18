import { urlFor } from '@/sanity/lib/image';
import { TwoColumnByMode } from '../types';
import { CtaGroup, SectionShell } from '@shared/components';
import { cn } from '@shared/utils';
import Image from 'next/image';

export default function Production({
  block,
  lang,
  mode,
  textColumnOrder,
  mediaColumnOrder,
  alignClass,
}: TwoColumnByMode) {
  return (
    <SectionShell background={block.background} sanityType={block._type}>
      <div className="container mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
        <div
          className={cn(
            'order-1 flex flex-col gap-6',
            textColumnOrder,
            alignClass
          )}
        >
          {block.content?.eyebrow && (
            <span className="text-primary text-xl font-black tracking-[0.2em] wrap-break-word uppercase md:text-2xl">
              {block.content.eyebrow}
            </span>
          )}
          {block.content?.heading && (
            <h2 className="text-3xl tracking-tight text-balance md:text-4xl">
              {block.content.heading}
            </h2>
          )}
          {block.content?.body && (
            <p className="text-muted-foreground text-base leading-relaxed text-pretty wrap-break-word">
              {block.content.body}
            </p>
          )}
          <CtaGroup
            ctas={block.ctas}
            lang={lang}
            mode={mode}
            alignment={block.content?.align}
            className="md:max-w-xs"
            fullWidth
          />
        </div>
        {block.media?.image && (
          <div className={cn('order-2 min-w-0', mediaColumnOrder)}>
            <div className="bg-muted relative aspect-square min-h-[272px] overflow-hidden rounded-2xl md:aspect-auto md:h-full">
              <Image
                src={urlFor(block.media.image).quality(80).fit('clip').url()}
                alt={block.media.alt ?? ''}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}
