'use client';

import { m } from 'motion/react';

import SectionShell from '@/components/page/SectionShell';
import { cn } from '@/lib/utils';
import { PhilosophySectionBlock } from '@/types/sanity';

interface PhilosophySectionProps {
  block: PhilosophySectionBlock;
}

export default function PhilosophySection({ block }: PhilosophySectionProps) {
  const defaultBackground = !block.background || block.background === 'default';

  return (
    <SectionShell
      background={block.background}
      sanityType={block._type}
      dataTestId="philosophy-section"
      className={cn(defaultBackground && 'bg-background')}
    >
      <div className="container mx-auto max-w-4xl">
        <m.blockquote
          className="font-primary text-center text-3xl leading-relaxed font-semibold whitespace-pre-line md:text-5xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          data-testid="philosophy-quote"
        >
          {block.quote}
        </m.blockquote>
      </div>
    </SectionShell>
  );
}
