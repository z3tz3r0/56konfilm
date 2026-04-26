import {
  CardCollectionSectionProps,
  getColumnsClass,
} from '../CardCollectionSection';
import { AppIcon, SectionShell } from '@shared/components';
import { cn } from '@shared/utils';

export default function Wedding({ block }: CardCollectionSectionProps) {
  const hasIcon = block.hasIcon;
  const columnClass = getColumnsClass(block.columns);
  return (
    <SectionShell background={block.background}>
      <div className="space-y-8">
        <div className="grid place-items-center gap-2">
          {block.title && (
            <h2 className="text-3xl font-semibold md:text-4xl">
              {block.title}
            </h2>
          )}
          {block.intro && <p>{block.intro}</p>}
        </div>
        {(block.cards?.length ?? 0) > 0 && (
          <section className={cn('grid grid-cols-1 gap-4', columnClass)}>
            {block.cards?.map((card, index) => {
              const { title, body, icon } = card;
              return (
                <article
                  key={card._key ?? index}
                  className={cn(
                    'grid grid-rows-subgrid gap-4 rounded-2xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg',
                    hasIcon ? 'row-span-3' : 'row-span-2'
                  )}
                >
                  {hasIcon && icon && <AppIcon iconName={icon.name} />}
                  {title && (
                    <h3
                      className={cn(
                        'text-xl font-semibold sm:text-2xl',
                        hasIcon && 'text-center'
                      )}
                    >
                      {title}
                    </h3>
                  )}
                  {body && <p className="text-sm">{body}</p>}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </SectionShell>
  );
}
