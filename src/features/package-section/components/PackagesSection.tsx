'use client';

import { m, type Variants } from 'motion/react';
import { CtaButton, SectionShell } from '@shared/components';
import { cn } from '@shared/utils/styling/tailwindUtils';
import { PackagesSectionBlock } from '../types';
import { Locale, SiteMode } from '@shared/config';

interface PackagesSectionProps {
  block: PackagesSectionBlock;
  lang: Locale;
  mode: SiteMode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
} satisfies Variants;

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
} satisfies Variants;

export default function PackagesSection({
  block,
  lang,
  mode,
}: PackagesSectionProps) {
  const defaultBackground = !block.background || block.background === 'default';

  return (
    <SectionShell
      background={block.background}
      sanityType={block._type}
      dataTestId='packages-section'
      className={cn(defaultBackground && 'bg-background')}
    >
      <div className='container mx-auto max-w-6xl space-y-12'>
        <header className='mx-auto flex max-w-3xl flex-col items-center gap-3 text-center'>
          {block.heading?.eyebrow ? (
            <span className='text-primary text-sm font-semibold tracking-[0.3em] uppercase'>
              {block.heading.eyebrow}
            </span>
          ) : null}
          {block.heading?.heading ? (
            <h2 className='text-3xl font-semibold md:text-5xl'>
              {block.heading.heading}
            </h2>
          ) : null}
          {block.heading?.body ? (
            <p className='text-muted-foreground max-w-2xl text-base leading-relaxed'>
              {block.heading.body}
            </p>
          ) : null}
        </header>

        {block.packages?.length ? (
          <m.div
            className='grid gap-6 md:grid-cols-3'
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
          >
            {block.packages.map((pkg, index) => {
              const isFeatured = Boolean(pkg.featured);
              const isProductionHighlight = isFeatured && mode === 'production';
              return (
                <m.article
                  key={pkg._key ?? index}
                  className={cn(
                    'border-border/60 row-span-3 grid min-w-0 grid-cols-1 grid-rows-subgrid gap-6 rounded-3xl border p-8 shadow-sm',
                    isFeatured
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-neutral text-neutral-foreground'
                  )}
                  data-testid='package-card'
                  data-featured={isFeatured ? 'true' : 'false'}
                  variants={itemVariants}
                >
                  <header className='row-start-1 flex min-w-0 flex-col gap-6 self-start'>
                    {pkg.title ? (
                      <h3
                        className={cn(
                          'text-center text-4xl font-semibold wrap-anywhere',
                          isProductionHighlight && 'text-text-primary'
                        )}
                      >
                        {pkg.title}
                      </h3>
                    ) : null}
                    <div className='flex items-baseline justify-center gap-1'>
                      <p
                        className={cn(
                          'text-5xl font-semibold',
                          isProductionHighlight && 'text-text-primary'
                        )}
                      >
                        {pkg.price ?? ''}
                      </p>
                      <p
                        className={cn(
                          'text-base uppercase',
                          isProductionHighlight
                            ? 'text-text-primary'
                            : isFeatured
                              ? 'text-primary-foreground/80'
                              : 'text-neutral-foreground-secondary'
                        )}
                      >
                        {pkg.currency ?? 'THB'}
                      </p>
                    </div>
                  </header>
                  {pkg.features?.length ? (
                    <ul
                      className={cn(
                        'row-start-2 flex flex-col gap-2 text-sm',
                        isProductionHighlight
                          ? 'text-text-primary'
                          : isFeatured
                            ? 'text-primary-foreground'
                            : 'text-neutral-foreground-secondary'
                      )}
                    >
                      {pkg.features.map((feature, featureIndex) => (
                        <li
                          key={`${pkg._key ?? index}-feature-${featureIndex}`}
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className='row-start-3 grid pt-2 [&>a]:grid'>
                    {pkg.cta ? (
                      <CtaButton
                        ctaButton={{
                          ...pkg.cta,
                          style: isFeatured ? 'neutral' : 'secondary',
                        }}
                        lang={lang}
                        mode={mode}
                        className={cn(
                          !isFeatured &&
                            'text-primary border border-current bg-transparent hover:bg-white/10',
                          isFeatured &&
                            mode === 'wedding' &&
                            'hover:not-disabled:bg-black'
                        )}
                        fullWidth
                      />
                    ) : null}
                  </div>
                </m.article>
              );
            })}
          </m.div>
        ) : null}
      </div>
    </SectionShell>
  );
}
