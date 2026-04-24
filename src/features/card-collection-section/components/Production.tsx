import { AppIcon, SectionShell } from '@shared/components';
import { cn } from '@shared/utils';
import HomeHighlightVariant from './HomeHighlightVariant';
import {
  CardCollectionSectionProps,
  getColumnsClass,
} from '../CardCollectionSection';

export default function Production(props: CardCollectionSectionProps) {
  const { block } = props;

  const isHighlightIntro = block.layoutVariant === 'highlight-intro';
  if (isHighlightIntro) return <HomeHighlightVariant {...props} />;

  const hasIcon = block.hasIcon;
  const columnClass = getColumnsClass(block.columns);

  return (
    <SectionShell background={block.background}>
      <div className="container mx-auto max-w-7xl space-y-10">
        <header className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          {block.title && (
            <h2 className="text-primary text-3xl font-semibold md:text-4xl">
              {block.title}
            </h2>
          )}
          {block.intro && (
            <p className="text-muted-foreground text-base">{block.intro}</p>
          )}
        </header>
        {(block.cards?.length ?? 0) > 0 && (
          <div className={cn('grid grid-cols-1 gap-8', columnClass)}>
            {block.cards?.map((card, index) => {
              const { icon } = card;
              return (
                <article
                  key={card._key ?? index}
                  className={cn(
                    'bg-neutral relative row-span-2 grid grid-rows-subgrid gap-4 rounded-2xl shadow-sm transition hover:-translate-y-1 hover:shadow-lg',
                    hasIcon ? 'px-8 py-16' : 'p-8'
                  )}
                >
                  {hasIcon && icon && (
                    <AppIcon
                      iconName={icon.name}
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  )}
                  {card.title && (
                    <h3 className="text-neutral-foreground text-center text-xl font-semibold sm:text-2xl">
                      {card.title}
                    </h3>
                  )}
                  {card.body && (
                    <p className="text-neutral-foreground-secondary text-sm">
                      {card.body}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
