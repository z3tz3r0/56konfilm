import { cn } from '@shared/utils';
import { CardCollectionSectionProps } from '../CardCollectionSection';
import { CtaButton, SectionShell } from '@shared/components';
import { getImageUrl } from '@/sanity/lib/image';
import Image from 'next/image';

export default function HomeHighlightVariant({
  block,
  lang,
  mode,
}: CardCollectionSectionProps) {
  return (
    <SectionShell background={block.background}>
      <div
        className={
          'flex snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] md:snap-none [&::-webkit-scrollbar]:hidden'
        }
      >
        <article className="bg-primary static z-1 grid w-[284px] shrink-0 snap-start gap-8 rounded-2xl p-8 md:sticky md:left-0 lg:snap-align-none">
          <div className="grid gap-2">
            {block.title && (
              <h2 className="text-2xl font-normal">{block.title}</h2>
            )}
            {block.intro && (
              <p className="font-primary text-[2rem] leading-[38px] font-bold">
                {block.intro}
              </p>
            )}
          </div>
          {block.hasButton && block.ctaButton && (
            <CtaButton
              fullWidth
              ctaButton={block.ctaButton}
              mode={mode}
              lang={lang}
            />
          )}
        </article>
        {block.cards?.map((card, index) => {
          const { title, bgImage } = card;
          return (
            <article
              key={card._key ?? index}
              className={cn(
                'group relative grid max-w-min min-w-[284px] shrink-0 snap-start place-items-center overflow-hidden rounded-2xl p-8 lg:snap-align-none',
                bgImage
                  ? 'text-text-primary bg-black/50'
                  : 'bg-off-white --text-tertiary'
              )}
            >
              {bgImage && (
                <div className="rounded-inherit absolute inset-0 -z-1 overflow-hidden">
                  <Image
                    src={getImageUrl(bgImage, {
                      width: 300,
                      height: 300,
                      fit: 'fill',
                    })}
                    alt=""
                    fill
                    sizes="284px"
                    className="ease-out-expo object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              {title && <h3 className="text-center">{title}</h3>}
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}
