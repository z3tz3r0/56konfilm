'use client';

import Image from 'next/image';
import { useState } from 'react';
import { m, AnimatePresence, type Variants } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { type LucideProps } from 'lucide-react';
import { SectionShell, SectionHeader } from '@shared/components';
import { cn } from '@shared/utils';
import { urlFor } from '@/sanity/lib/image';
import { useDeviceTier } from '@shared/hooks';
import { CapabilitiesSectionBlock } from '../types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (
    LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>
  )[name];
  return Icon ? <Icon {...props} /> : null;
}

interface CapabilitiesSectionProps {
  block: CapabilitiesSectionBlock;
}

export default function CapabilitiesSection({
  block,
}: CapabilitiesSectionProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const useLiteMotion = isInitialized && !allowHeavyMotion;
  const features = block.features ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = features[activeIndex];

  const isAccordion = block.layout !== 'grid' && features.some((f) => f.image);

  return (
    <SectionShell
      background={block.background}
      dataTestId='capabilities-section'
    >
      <div className='container mx-auto'>
        {block.heading && (
          <SectionHeader heading={block.heading} className='mb-14' />
        )}

        {features.length ? (
          isAccordion ? (
            /* ── Accordion + Image Layout ── */
            <div className='grid gap-8 lg:grid-cols-2 lg:gap-16'>
              {/* Left: Accordion list */}
              <div className='divide-border flex flex-col divide-y'>
                {features.map((feature, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <button
                      key={feature._key ?? index}
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        'flex flex-col gap-2 py-5 text-left transition-colors',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      data-testid='feature-accordion-item'
                      aria-expanded={isActive}
                    >
                      <div className='flex items-center gap-3'>
                        {feature.icon && (
                          <span
                            className={cn(
                              'transition-colors',
                              isActive
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            )}
                          >
                            <DynamicIcon
                              name={feature.icon}
                              size={18}
                              strokeWidth={1.5}
                            />
                          </span>
                        )}
                        <span
                          className={cn(
                            'text-base font-semibold transition-colors',
                            isActive
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          )}
                        >
                          {feature.title}
                        </span>
                        {/* Active indicator */}
                        <span
                          className={cn(
                            'ml-auto h-1 w-1 rounded-full transition-all duration-300',
                            isActive ? 'bg-primary scale-150' : 'bg-border'
                          )}
                        />
                      </div>

                      <AnimatePresence initial={false}>
                        {isActive && feature.description && (
                          <m.p
                            key='body'
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className='text-muted-foreground overflow-hidden text-sm leading-relaxed'
                          >
                            {feature.description}
                          </m.p>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>

              {/* Right: Dynamic image */}
              <div className='relative aspect-[4/3] w-full overflow-hidden rounded-xl'>
                <AnimatePresence mode='wait'>
                  {activeFeature?.image ? (
                    <m.div
                      key={activeIndex}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className='absolute inset-0'
                    >
                      <Image
                        src={urlFor(activeFeature.image)
                          .width(900)
                          .height(675)
                          .quality(85)
                          .url()}
                        alt={activeFeature.title ?? ''}
                        fill
                        className='object-cover'
                        sizes='(max-width: 1024px) 100vw, 50vw'
                      />
                    </m.div>
                  ) : (
                    <m.div
                      key='placeholder'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='bg-muted absolute inset-0 flex items-center justify-center'
                    >
                      {activeFeature?.icon && (
                        <span className='text-muted-foreground/30'>
                          <DynamicIcon
                            name={activeFeature.icon}
                            size={64}
                            strokeWidth={1}
                          />
                        </span>
                      )}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* ── Icon Grid Layout ── */
            <m.div
              className={cn(
                'grid gap-8',
                features.length <= 3
                  ? 'md:grid-cols-3'
                  : features.length === 4
                    ? 'md:grid-cols-2 lg:grid-cols-4'
                    : 'md:grid-cols-2 lg:grid-cols-3'
              )}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, margin: '-60px' }}
              variants={useLiteMotion ? undefined : containerVariants}
            >
              {features.map((feature, index) => (
                <m.div
                  key={feature._key ?? index}
                  className='border-border bg-card flex flex-col gap-4 rounded-xl border p-6'
                  variants={useLiteMotion ? undefined : cardVariants}
                  data-testid='feature-grid-item'
                >
                  {feature.icon && (
                    <span className='text-primary bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                      <DynamicIcon
                        name={feature.icon}
                        size={20}
                        strokeWidth={1.5}
                      />
                    </span>
                  )}
                  {feature.title && (
                    <h3 className='text-foreground text-base font-semibold'>
                      {feature.title}
                    </h3>
                  )}
                  {feature.description && (
                    <p className='text-muted-foreground text-sm leading-relaxed'>
                      {feature.description}
                    </p>
                  )}
                </m.div>
              ))}
            </m.div>
          )
        ) : null}
      </div>
    </SectionShell>
  );
}
