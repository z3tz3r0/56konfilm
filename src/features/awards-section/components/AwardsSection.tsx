'use client';

import Image from 'next/image';
import { m, type Variants } from 'motion/react';
import { SectionShell, SectionHeader } from '@shared/components';
import { urlFor } from '@/sanity/lib/image';
import { useDeviceTier } from '@shared/hooks';
import { AwardsSectionBlock } from '../types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

interface AwardsSectionProps {
  block: AwardsSectionBlock;
}

export default function AwardsSection({ block }: AwardsSectionProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const useLiteMotion = isInitialized && !allowHeavyMotion;

  return (
    <SectionShell background={block.background} dataTestId='awards-section'>
      <div className='container mx-auto'>
        {block.heading && (
          <SectionHeader heading={block.heading} className='mb-14' />
        )}

        {block.awards?.length ? (
          <m.div
            className='divide-border divide-y'
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-60px' }}
            variants={useLiteMotion ? undefined : containerVariants}
          >
            {/* Header row */}
            <div
              className='text-muted-foreground hidden grid-cols-[1fr_1fr_auto] gap-6 pb-4 text-xs font-semibold tracking-widest uppercase md:grid'
              aria-hidden='true'
            >
              <span>Award</span>
              <span>Event / Festival</span>
              <span>Year</span>
            </div>

            {block.awards.map((award, index) => (
              <m.div
                key={award._key ?? index}
                className='group grid grid-cols-1 items-center gap-2 py-5 md:grid-cols-[1fr_1fr_auto] md:gap-6'
                variants={useLiteMotion ? undefined : rowVariants}
                data-testid='award-item'
              >
                {/* Award name + optional logo */}
                <div className='flex items-center gap-3'>
                  {award.logo && (
                    <div className='bg-muted relative h-8 w-8 shrink-0 overflow-hidden rounded-sm'>
                      <Image
                        src={urlFor(award.logo).width(64).height(64).url()}
                        alt={award.name ?? ''}
                        fill
                        className='object-contain p-0.5'
                        sizes='32px'
                      />
                    </div>
                  )}
                  <span className='text-foreground leading-tight font-medium'>
                    {award.name}
                  </span>
                </div>

                {/* Event */}
                <span className='text-muted-foreground text-sm'>
                  {award.event ?? '—'}
                </span>

                {/* Year */}
                <span className='text-primary font-mono text-sm font-semibold'>
                  {award.year ?? ''}
                </span>
              </m.div>
            ))}
          </m.div>
        ) : null}
      </div>
    </SectionShell>
  );
}
