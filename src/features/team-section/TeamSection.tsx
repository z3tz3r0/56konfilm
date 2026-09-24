'use client';

import { m } from 'motion/react';
import { SectionShell, SectionHeader } from '@shared/components';
import { TeamSectionBlock } from './types';
import TeamCard from './components/TeamCard';
import { useDeviceTier } from '@shared/hooks';
import { staggerContainerVariants } from '@shared/lib/motion';
import { Locale } from '@shared/config';

interface TeamSectionProps {
  lang: Locale;
  block: TeamSectionBlock;
}

export default function TeamSection({ lang, block }: TeamSectionProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const useLiteMotion = isInitialized && !allowHeavyMotion;

  return (
    <SectionShell
      background={block.background}
      sanityType={block._type}
      dataTestId='team-section'
    >
      <div className='space-y-14'>
        {block.heading && (
          <SectionHeader isEmphasizedVariant heading={block.heading} />
        )}
        {block.members?.length && (
          <m.div
            className='grid gap-8 sm:grid-cols-3 md:gap-10 lg:grid-cols-4'
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-80px' }}
            variants={useLiteMotion ? undefined : staggerContainerVariants}
          >
            {block.members?.map((member, index) => (
              <TeamCard
                key={member._key ?? index}
                lang={lang}
                member={member}
              />
            ))}
          </m.div>
        )}
      </div>
    </SectionShell>
  );
}
