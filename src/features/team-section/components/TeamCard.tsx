'use client';

import { m } from 'motion/react';
import { urlFor } from '@/sanity/lib/image';
import { useDeviceTier } from '@shared/hooks';
import { fadeUpItemVariants } from '@shared/lib/motion';
import Image from 'next/image';
import { TeamSectionBlock } from '../types';
import { Locale } from '@shared/config';

type NonNullableMember = NonNullable<TeamSectionBlock['members']>[number];
interface TeamCardProps {
  lang: Locale;
  member: NonNullableMember;
}

export default function TeamCard({ lang, member }: TeamCardProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const useLiteMotion = isInitialized && !allowHeavyMotion;

  return (
    <m.article
      className='bg-neutral mx-auto flex max-w-[370px] flex-col items-center overflow-hidden rounded-2xl text-center'
      variants={useLiteMotion ? undefined : fadeUpItemVariants}
      data-testid='team-member'
    >
      {member.image ? (
        <div className='group relative aspect-4/3 w-full overflow-hidden'>
          <Image
            src={urlFor(member.image).width(300).height(300).fit('fill').url()}
            alt={member.name ?? 'Team member'}
            fill
            className='object-cover transition-transform duration-700 ease-out group-hover:scale-105'
            sizes='(min-width: 768px) 250px, 370px'
          />
          <div className='group-hover:bg-background/10 absolute inset-0 bg-transparent transition-colors duration-700 ease-out' />
        </div>
      ) : (
        <div className='bg-off-white text-text-tertiary flex h-full w-full items-center justify-center'>
          {lang === 'en' ? 'No Image' : 'ไม่มีรูปภาพ'}
        </div>
      )}
      <section className='text-neutral-foreground-secondary space-y-3 p-4'>
        <div className='space-y-1'>
          <h3 className='text-neutral-foreground text-base font-semibold'>
            {member.name}
          </h3>
          <p className='text-sm font-semibold'>{member.role}</p>
        </div>
        {member.bio && <p className='text-xs leading-relaxed'>{member.bio}</p>}
      </section>
    </m.article>
  );
}
