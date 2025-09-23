import Image from 'next/image';

import SectionShell from '@/components/page/SectionShell';
import CtaGroup from '@/components/page/CtaGroup';
import { getAlignmentClass } from '@/components/page/utils';
import { cn } from '@/lib/utils';
import { urlFor } from '@/sanity/lib/image';
import { MediaGallerySectionBlock } from '@/types/sanity';

interface MediaGallerySectionProps {
  block: MediaGallerySectionBlock;
}

export default function MediaGallerySection({ block }: MediaGallerySectionProps) {
  const alignClass = getAlignmentClass(block.heading?.align);

  return (
    <SectionShell background={block.background}>
      <div className="container space-y-10">
        <header className={cn('flex flex-col gap-3 text-balance', alignClass)}>
          {block.heading?.eyebrow ? (
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {block.heading.eyebrow}
            </span>
          ) : null}
          {block.heading?.heading ? (
            <h2 className="text-3xl font-semibold md:text-4xl">{block.heading.heading}</h2>
          ) : null}
          {block.heading?.body ? (
            <p className="max-w-3xl text-base text-muted-foreground">{block.heading.body}</p>
          ) : null}
        </header>
        {block.items?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {block.items.map((item, index) => {
              const image = item.media?.image;
              if (!image) {
                return null;
              }

              return (
                <figure
                  key={item.media?.alt ?? item.label ?? index}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={urlFor(image).width(720).height(540).quality(80).fit('clip').url()}
                      alt={item.media?.alt ?? item.label ?? 'Gallery item'}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  {item.label ? <figcaption className="p-4 text-sm text-muted-foreground">{item.label}</figcaption> : null}
                </figure>
              );
            })}
          </div>
        ) : null}
        <CtaGroup ctas={block.cta ? [block.cta] : undefined} alignment={block.heading?.align} />
      </div>
    </SectionShell>
  );
}
