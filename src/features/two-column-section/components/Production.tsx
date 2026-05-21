import { urlFor } from '@/sanity/lib/image';
import { TwoColumnByMode } from '../types';
import { CtaGroup, HighlightedText, SectionShell } from '@shared/components';
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
  const headingText = block.content?.heading;
  return (
    <SectionShell background={block.background} sanityType={block._type}>
      {block.sectionVariant === 'emphasized' && headingText && (
        <div className='mb-16 grid gap-4'>
          <HighlightedText
            text={headingText}
            className='text-4xl tracking-tight text-balance md:text-5xl'
          />
          <div className='bg-titanium-white h-px w-full' />
        </div>
      )}
      <div className='grid gap-16 md:grid-cols-2 md:gap-8'>
        <section
          className={cn(
            'text-text-secondary order-1 flex flex-col gap-8',
            textColumnOrder,
            alignClass
          )}
        >
          <div className='grid gap-4'>
            {block.sectionVariant !== 'emphasized' &&
              block.content?.eyebrow && (
                <span className='text-primary text-xl font-black tracking-[0.2em] wrap-break-word uppercase md:text-2xl'>
                  {block.content.eyebrow}
                </span>
              )}
            {block.sectionVariant !== 'emphasized' && headingText && (
              <HighlightedText
                text={headingText}
                className='text-text-primary text-3xl tracking-tight text-balance md:text-4xl'
              />
            )}
            {block.content?.body && (
              <p className='text-base leading-relaxed text-pretty wrap-break-word'>
                {block.content.body}
              </p>
            )}
          </div>
          <CtaGroup
            ctas={block.ctas}
            lang={lang}
            mode={mode}
            alignment={block.content?.align}
            className='md:max-w-xs'
            fullWidth
          />
        </section>
        {block.media?.image && (
          <section className={cn('order-2 min-w-0', mediaColumnOrder)}>
            <div className='bg-muted relative aspect-568/358 max-h-[358px] max-w-[568px] overflow-hidden rounded-2xl'>
              <Image
                src={urlFor(block.media.image).quality(80).fit('clip').url()}
                alt={block.media.alt ?? ''}
                fill
                className='object-cover'
                sizes='(min-width: 768px) 50vw, 100vw'
              />
            </div>
          </section>
        )}
      </div>
    </SectionShell>
  );
}
