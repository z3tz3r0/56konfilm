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
  4: 'md:grid-cols-4',
};

export default function CardCollectionSection({ block }: CardCollectionSectionProps) {
  const columnsClass = columnsMap[block.columns ?? 3] ?? columnsMap[3];

  return (
    <SectionShell background={block.background}>
      <div className="container space-y-10">
        <header className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          {block.title ? <h2 className="text-3xl font-semibold md:text-4xl">{block.title}</h2> : null}
          {block.intro ? <p className="text-base text-muted-foreground">{block.intro}</p> : null}
        </header>
        {block.cards?.length ? (
          <div className={cn('grid gap-6', columnsClass)}>
            {block.cards.map((card, index) => (
              <article
                key={card.title ?? index}
                className={cn(
                  'flex h-full flex-col gap-4 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg',
                  card.variant === 'highlighted' ? 'border-primary/60 ring-1 ring-primary/20' : null
                )}
              >
                {card.icon ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-primary/10">
                    <Image
                      src={urlFor(card.icon).width(96).height(96).fit('clip').url()}
                      alt={card.title ?? 'Icon'}
                      fill
                      className="object-contain p-2"
                      sizes="48px"
                    />
                  </div>
                ) : null}
                {card.title ? <h3 className="text-xl font-semibold">{card.title}</h3> : null}
                {card.body ? <p className="text-sm text-muted-foreground">{card.body}</p> : null}
                <div className="mt-auto pt-4">{card.cta ? <CtaButton cta={card.cta} /> : null}</div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
