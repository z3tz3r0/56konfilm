import { cn } from '@shared/utils';
import { CardCollectionSectionProps } from '../CardCollectionSection';
import {
  ScrollableCarousel,
  CarouselContent,
  CarouselItem,
  CtaButton,
  SectionShell,
} from '@shared/components';
import { getImageUrl } from '@/sanity/lib/image';
import Image from 'next/image';

export default function HomeHighlightVariant(
  props: CardCollectionSectionProps
) {
  const { block } = props;
  return (
    <SectionShell background={block.background}>
      <div className='flex w-full md:gap-4'>
        <IntroCard className='hidden shrink-0 md:grid' {...props} />
        <ScrollableCarousel
          opts={{
            align: 'start',
            breakpoints: {
              '(min-width: 768px)': { dragFree: true, containScroll: false },
            },
          }}
          className='w-full'
        >
          <CarouselContent
            wrapperClass='h-full'
            className='ml-0 h-full cursor-grab space-x-4 select-none active:cursor-grabbing'
          >
            <CarouselItem className='basis-auto md:hidden'>
              <IntroCard {...props} />
            </CarouselItem>
            {block.cards?.map((card, index) => {
              const { title, bgImage } = card;
              return (
                <CarouselItem
                  key={card._key ?? index}
                  className={cn(
                    'group relative grid h-full max-w-min min-w-[284px] place-items-center overflow-hidden rounded-2xl p-8',
                    bgImage
                      ? 'text-text-primary bg-black/50'
                      : 'bg-off-white --text-tertiary'
                  )}
                >
                  {bgImage && (
                    <div className='rounded-inherit absolute inset-0 -z-1 overflow-hidden'>
                      <Image
                        src={getImageUrl(bgImage, {
                          width: 300,
                          height: 300,
                          fit: 'fill',
                        })}
                        alt=''
                        fill
                        sizes='284px'
                        className='ease-out-expo object-cover transition-transform duration-500 group-hover:scale-105'
                      />
                    </div>
                  )}
                  {title && <h3 className='text-center'>{title}</h3>}
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </ScrollableCarousel>
      </div>
    </SectionShell>
  );
}

interface IntroCardProps extends CardCollectionSectionProps {
  className?: string;
}

function IntroCard({ block, lang, mode, className }: IntroCardProps) {
  return (
    <article
      className={cn(
        'bg-primary grid w-[284px] gap-8 rounded-2xl p-8',
        className
      )}
    >
      <div className='grid gap-2'>
        {block.title && <h2 className='text-2xl font-normal'>{block.title}</h2>}
        {block.intro && (
          <p className='font-primary text-[2rem] leading-[38px] font-bold'>
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
  );
}
