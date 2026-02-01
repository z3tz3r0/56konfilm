import Image from 'next/image';

import CtaButton from '@/components/page/CtaButton';
import SectionShell from '@/components/page/SectionShell';
import { cn } from '@/lib/utils';
import { urlFor } from '@/sanity/lib/image';
import { CardCollectionSectionBlock } from '@/types/sanity';

interface CardCollectionSectionProps {
  block: CardCollectionSectionBlock;
}

const columnsMap: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export default function CardCollectionSection({
  block,
}: CardCollectionSectionProps) {
  const columnsClass = columnsMap[block.columns ?? 3] ?? columnsMap[3];

  return (
    <SectionShell background={block.background}>
      <div className="container mx-auto max-w-7xl space-y-10">
        <header className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          {block.title ? (
            <h2 className="text-3xl font-semibold md:text-4xl">
              {block.title}
            </h2>
          ) : null}
          {block.intro ? (
            <p className="text-muted-foreground text-base">{block.intro}</p>
          ) : null}
        </header>
        {block.cards?.length ? (
          <div className={cn('grid gap-6', columnsClass)}>
            {block.cards.map((card, index) => (
              <article
                key={card._key ?? index}
                className={cn(
                  'border-border/60 bg-background/80 flex h-full flex-col gap-4 rounded-2xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg',
                  card.variant === 'highlighted'
                    ? 'border-primary/60 ring-primary/20 ring-1'
                    : null
                )}
              >
                {card.icon ? (
                  <div className="bg-primary/10 relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={urlFor(card.icon)
                        .width(96)
                        .height(96)
                        .fit('clip')
                        .url()}
                      alt={card.title ?? 'Icon'}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                {card.title ? (
                  <h3 className="text-xl font-semibold sm:text-2xl">
                    {card.title}
                  </h3>
                ) : null}
                {card.body ? (
                  <p className="text-foreground text-sm">{card.body}</p>
                ) : null}
                <div className="mt-auto pt-4">
                  {card.cta ? <CtaButton cta={card.cta} /> : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
