'use client';

import { m, type Variants } from 'motion/react';
import { SectionShell, SectionHeader } from '@shared/components';
import { useDeviceTier } from '@shared/hooks';
import { StatsCounterSectionBlock } from '../types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

interface StatsCounterSectionProps {
  block: StatsCounterSectionBlock;
}

export default function StatsCounterSection({
  block,
}: StatsCounterSectionProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const useLiteMotion = isInitialized && !allowHeavyMotion;

  return (
    <SectionShell
      background={block.background}
      dataTestId="stats-counter-section"
    >
      <div className="container mx-auto">
        {block.heading && (
          <SectionHeader
            heading={block.heading}
            className="mx-auto mb-12 max-w-3xl text-center"
          />
        )}
        {block.stats?.length ? (
          <m.div
            className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={useLiteMotion ? undefined : containerVariants}
          >
            {block.stats.map((stat, index) => (
              <m.div
                key={stat._key ?? index}
                className="flex flex-col items-center text-center"
                variants={useLiteMotion ? undefined : itemVariants}
                data-testid="stat-item"
              >
                <span className="text-primary text-4xl font-black md:text-5xl lg:text-6xl">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-primary/70">{stat.suffix}</span>
                  )}
                </span>
                <span className="text-muted-foreground mt-2 text-sm font-medium tracking-wider uppercase">
                  {stat.label}
                </span>
              </m.div>
            ))}
          </m.div>
        ) : null}
      </div>
    </SectionShell>
  );
}
