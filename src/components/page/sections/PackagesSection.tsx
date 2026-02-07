'use client';

import { motion, type Variants } from 'motion/react';

import CtaButton from '@/components/page/CtaButton';
import SectionShell from '@/components/page/SectionShell';
import { cn } from '@/lib/utils';
import { PackagesSectionBlock } from '@/types/sanity';

interface PackagesSectionProps {
  block: PackagesSectionBlock;
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

export default function PackagesSection({ block }: PackagesSectionProps) {
  const defaultBackground = !block.background || block.background === 'default';

  return (
    <SectionShell
      background={block.background}
      sanityType={block._type}
      dataTestId="packages-section"
      className={cn(defaultBackground && 'bg-background')}
    >
      <div className="container mx-auto max-w-6xl space-y-12">
        <header className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
          {block.heading?.eyebrow ? (
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              {block.heading.eyebrow}
            </span>
          ) : null}
          {block.heading?.heading ? (
            <h2 className="text-3xl font-semibold md:text-5xl">
              {block.heading.heading}
            </h2>
          ) : null}
          {block.heading?.body ? (
            <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
              {block.heading.body}
            </p>
          ) : null}
        </header>

        {block.packages?.length ? (
          <motion.div
            className="grid gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
          >
            {block.packages.map((pkg, index) => {
              const isFeatured = Boolean(pkg.featured);
              return (
                <motion.article
                  key={pkg._key ?? index}
                  className={cn(
                    'border-border/60 bg-background/80 flex h-full flex-col gap-6 rounded-3xl border p-8 shadow-sm',
                    isFeatured && 'text-white'
                  )}
                  style={
                    isFeatured
                      ? { backgroundColor: 'var(--color-brown)' }
                      : undefined
                  }
                  data-testid="package-card"
                  data-featured={isFeatured ? 'true' : 'false'}
                  variants={itemVariants}
                >
                  {pkg.title ? (
                    <h3 className="text-2xl font-semibold md:text-3xl">
                      {pkg.title}
                    </h3>
                  ) : null}
                  <div className="space-y-1">
                    <p className="text-4xl font-semibold md:text-5xl">
                      {pkg.price ?? ''}
                    </p>
                    <p className={cn('text-sm uppercase tracking-[0.2em]', isFeatured ? 'text-white/80' : 'text-muted-foreground')}>
                      {pkg.currency ?? 'THB'}
                    </p>
                  </div>
                  {pkg.features?.length ? (
                    <ul className={cn('space-y-2 text-sm', isFeatured ? 'text-white/90' : 'text-muted-foreground')}>
                      {pkg.features.map((feature, featureIndex) => (
                        <li key={`${pkg._key ?? index}-feature-${featureIndex}`}>{feature}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-auto pt-2">
                    {pkg.cta ? (
                      <CtaButton
                        cta={pkg.cta}
                        className={cn(
                          'border border-current bg-transparent text-current hover:bg-white/10',
                          !isFeatured && 'text-primary'
                        )}
                        fullWidth
                      />
                    ) : null}
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        ) : null}
      </div>
    </SectionShell>
  );
}
