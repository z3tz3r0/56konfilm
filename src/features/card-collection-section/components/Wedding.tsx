import { CardCollectionSectionProps } from '@features/card-collection-section/CardCollectionSection';
import { AppIcon, SectionShell } from '@shared/components';
import { cn } from '@shared/utils';

export default function Wedding({ block }: CardCollectionSectionProps) {
  const hasIcon = block.hasIcon;
  return (
    <SectionShell background={block.background}>
      <div className="mb-16 grid place-items-center gap-4">
        {block.title && <h2>{block.title}</h2>}
        {block.intro && <p>{block.intro}</p>}
      </div>
      {block.cards?.length && (
        <div
          className={`grid grid-cols-1 lg:gap-x-8 lg:grid-cols-${block.columns}`}
        >
          {block.cards?.map((card, index) => {
            const { title, body, icon } = card;
            return (
              <article
                key={card._key ?? index}
                className={cn(
                  'grid grid-rows-subgrid',
                  hasIcon ? 'row-span-3' : 'row-span-2'
                )}
              >
                {hasIcon && icon && <AppIcon iconName={icon.name} />}
                {title && <h3 className="text-center">{title}</h3>}
                {body && <p className="mt-4">{body}</p>}
              </article>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
