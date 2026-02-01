'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

import CtaGroup from '@/components/page/CtaGroup';
import SectionShell from '@/components/page/SectionShell';
import { getAlignmentClass } from '@/components/page/utils';
import { cn } from '@/lib/utils';
import { urlFor } from '@/sanity/lib/image';
import { MediaGallerySectionBlock } from '@/types/sanity';

interface MediaGallerySectionProps {
  block: MediaGallerySectionBlock;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as any,
    }
  },
};

export default function MediaGallerySection({ block }: MediaGallerySectionProps) {
  const alignClass = getAlignmentClass(block.heading?.align);
  const isCentered = block.heading?.align === 'center';

  return (
    <SectionShell background={block.background}>
      <div className="container mx-auto space-y-12">

        <header className={cn('flex flex-col gap-4 text-balance', alignClass, isCentered && 'mx-auto text-center')}>
          {block.heading?.eyebrow ? (
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {block.heading.eyebrow}
            </span>
          ) : null}
          {block.heading?.heading ? (
            <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl">{block.heading.heading}</h2>
          ) : null}
          {block.heading?.body ? (
            <p className="max-w-3xl text-lg text-muted-foreground wrap-break-word font-light leading-relaxed">
              {block.heading.body}
            </p>
          ) : null}
        </header>
        
        {block.items?.length ? (
          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {block.items.map((item, index) => {
              const image = item.media?.image;
              if (!image) {
                return null;
              }

              return (
                <motion.figure
                  key={item._key ?? index}
                  className="group relative overflow-hidden rounded-2xl bg-muted"
                  variants={itemVariants}
                >
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={urlFor(image).width(800).height(600).quality(90).url()}
                      alt={item.media?.alt ?? item.label ?? 'Gallery item'}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    {/* Gradient overlay for better text readability if we had overlay text, 
                        but effectively adds depth on hover */}
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                  </div>
                  {item.label ? (
                    <figcaption className="mt-3 px-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                      {item.label}
                    </figcaption>
                  ) : null}
                </motion.figure>
              );
            })}
          </motion.div>
        ) : null}

        <CtaGroup 
          ctas={block.cta ? [block.cta] : undefined} 
          alignment={block.heading?.align} 
        />
      </div>
    </SectionShell>
  );
}
