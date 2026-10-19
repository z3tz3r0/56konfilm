'use client';

import { m } from 'motion/react';
import { AppIcon, HighlightedText, SectionShell } from '@shared/components';
import { cn } from '@shared/utils/styling/tailwindUtils';
import type { PhilosophySectionBlock } from '../types';

interface PhilosophySectionProps {
  block: PhilosophySectionBlock;
}

export default function PhilosophySection({ block }: PhilosophySectionProps) {
  const defaultBackground = !block.background || block.background === 'default';
  const quote = block.quote ?? '';
  const quoteIconClass = cn(
    'size-[60px] md:size-[100px]',
    block.background === 'contrast'
      ? 'text-primary-foreground/20'
      : 'text-primary/20'
  );

  return (
    <SectionShell
      background={block.background}
      sanityType={block._type}
      dataTestId='philosophy-section'
      className={cn(defaultBackground && 'bg-background')}
    >
      <div className='container mx-auto'>
        <m.blockquote
          className='relative mx-auto grid max-w-[922px] md:grid-cols-[100px_minmax(0,1fr)_100px] md:items-start md:gap-4'
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          data-testid='philosophy-quote'
        >
          {quote.trim() ? (
            <>
              <div
                aria-hidden='true'
                data-testid='philosophy-opening-quote'
                className='pointer-events-none absolute -top-8 -left-4 md:static md:col-start-1 md:row-start-1'
              >
                <AppIcon
                  iconName='bi:quote'
                  variant='plain'
                  className={quoteIconClass}
                />
              </div>
              <HighlightedText
                text={quote}
                className='font-primary relative z-10 min-w-0 text-center text-[24px] font-bold wrap-break-word whitespace-pre-line md:col-start-2 md:row-start-1 md:text-[40px]'
              />
              <div
                aria-hidden='true'
                data-testid='philosophy-closing-quote'
                className='pointer-events-none absolute -top-8 -right-4 md:static md:col-start-3 md:row-start-1'
              >
                <AppIcon
                  iconName='bi:quote'
                  variant='plain'
                  className={cn(quoteIconClass, 'rotate-180')}
                />
              </div>
            </>
          ) : null}
        </m.blockquote>
      </div>
    </SectionShell>
  );
}
