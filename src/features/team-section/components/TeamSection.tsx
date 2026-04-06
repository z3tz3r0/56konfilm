'use client';

import { m, type Variants } from 'motion/react';
import Image from 'next/image';
import { SectionShell, SectionHeader } from '@shared/components';
import { useDeviceTier } from '@shared/hooks';
import { urlFor } from '@/sanity/lib/image';
import { TeamSectionBlock } from '../types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

interface TeamSectionProps {
  block: TeamSectionBlock;
}

export default function TeamSection({ block }: TeamSectionProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const useLiteMotion = isInitialized && !allowHeavyMotion;

  return (
    <SectionShell background={block.background} dataTestId="team-section">
      <div className="container mx-auto">
        {block.heading && (
          <SectionHeader
            heading={block.heading}
            className="mx-auto mb-14 max-w-3xl text-center"
          />
        )}
        {block.members?.length ? (
          <m.div
            className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 md:gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={useLiteMotion ? undefined : containerVariants}
          >
            {block.members.map((member, index) => (
              <m.article
                key={member._key ?? index}
                className="flex flex-col items-center text-center"
                variants={useLiteMotion ? undefined : itemVariants}
                data-testid="team-member"
              >
                {member.image && (
                  <div className="bg-muted relative mb-4 size-28 overflow-hidden rounded-full md:size-32">
                    <Image
                      src={urlFor(member.image)
                        .width(256)
                        .height(256)
                        .fit('crop')
                        .url()}
                      alt={member.name ?? 'Team member'}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 128px, 112px"
                    />
                  </div>
                )}
                <h3 className="text-foreground text-base font-semibold">
                  {member.name}
                </h3>
                {member.role && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {member.role}
                  </p>
                )}
                {member.bio && (
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    {member.bio}
                  </p>
                )}
              </m.article>
            ))}
          </m.div>
        ) : null}
      </div>
    </SectionShell>
  );
}
