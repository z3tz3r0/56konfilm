'use client';

import { m, type Variants } from 'motion/react';
import { SectionShell, SectionHeader } from '@shared/components';
import { DynamicLucideIcon } from '@shared/components/common/DynamicLucideIcon';
import { cn } from '@shared/utils';
import { useDeviceTier } from '@shared/hooks';
import { ProcessSectionBlock } from '../types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

interface ProcessSectionProps {
  block: ProcessSectionBlock;
}

export default function ProcessSection({ block }: ProcessSectionProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const useLiteMotion = isInitialized && !allowHeavyMotion;
  const isTimeline = block.layout === 'timeline';

  return (
    <SectionShell background={block.background} dataTestId='process-section'>
      <div className='container mx-auto'>
        {block.heading && (
          <SectionHeader
            heading={block.heading}
            className='mx-auto mb-16 max-w-3xl text-center'
          />
        )}

        {block.steps?.length ? (
          isTimeline ? (
            /* ── Timeline Layout ── */
            <m.ol
              className='relative mx-auto max-w-2xl space-y-0'
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, margin: '-80px' }}
              variants={useLiteMotion ? undefined : containerVariants}
            >
              {block.steps.map((step, index) => {
                const isLast = index === block.steps!.length - 1;
                return (
                  <m.li
                    key={step._key ?? index}
                    className='relative flex gap-6 pb-10'
                    variants={useLiteMotion ? undefined : itemVariants}
                    data-testid='process-step'
                  >
                    {/* Vertical connector line */}
                    {!isLast && (
                      <div
                        aria-hidden='true'
                        className='bg-border absolute top-10 left-5 h-full w-px -translate-x-1/2'
                      />
                    )}

                    {/* Step dot / number */}
                    <div className='bg-primary text-primary-foreground relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                      {String(step.stepNumber ?? index + 1).padStart(2, '0')}
                    </div>

                    {/* Content */}
                    <div className='pt-1 pb-2'>
                      {step.title && (
                        <h3 className='text-foreground mb-2 text-lg font-semibold'>
                          {step.title}
                        </h3>
                      )}
                      {step.description && (
                        <p className='text-muted-foreground text-sm leading-relaxed'>
                          {step.description}
                        </p>
                      )}
                    </div>
                  </m.li>
                );
              })}
            </m.ol>
          ) : (
            /* ── Numbered Grid Layout ── */
            <m.ol
              className={cn(
                'grid gap-10',
                block.steps.length <= 3
                  ? 'md:grid-cols-3'
                  : block.steps.length === 4
                    ? 'md:grid-cols-4'
                    : 'md:grid-cols-3 lg:grid-cols-5'
              )}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, margin: '-80px' }}
              variants={useLiteMotion ? undefined : containerVariants}
            >
              {block.steps.map((step, index) => (
                <m.li
                  key={step._key ?? index}
                  className='group flex flex-col gap-4'
                  variants={useLiteMotion ? undefined : itemVariants}
                  data-testid='process-step'
                >
                  {/* Step number */}
                  <div className='flex items-end gap-3'>
                    <span className='text-primary/20 text-7xl leading-none font-black tabular-nums'>
                      {String(step.stepNumber ?? index + 1).padStart(2, '0')}
                    </span>
                    {step.icon && (
                      <span className='text-primary mb-1'>
                        <DynamicLucideIcon
                          name={step.icon}
                          size={24}
                          strokeWidth={1.5}
                        />
                      </span>
                    )}
                  </div>

                  {/* Separator */}
                  <div className='bg-border h-px w-full' />

                  {/* Text */}
                  {step.title && (
                    <h3 className='text-foreground text-base font-semibold tracking-tight'>
                      {step.title}
                    </h3>
                  )}
                  {step.description && (
                    <p className='text-muted-foreground text-sm leading-relaxed'>
                      {step.description}
                    </p>
                  )}
                </m.li>
              ))}
            </m.ol>
          )
        ) : null}
      </div>
    </SectionShell>
  );
}
