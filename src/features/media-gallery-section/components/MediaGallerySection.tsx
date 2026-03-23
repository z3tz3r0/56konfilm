'use client';

import { m, type Variants } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CtaGroup, SectionShell } from '@shared/components';
import { getAlignmentClass } from '@shared/utils';
import { useDeviceTier } from '@shared/hooks';
import { cn } from '@shared/utils';
import { urlFor } from '@/sanity/lib/image';
import { MediaGallerySectionBlock } from '../types';
import { GalleryCard, VideoItem } from '.';
import { Locale, SiteMode } from '@shared/config';

interface MediaGallerySectionProps {
  block: MediaGallerySectionBlock;
  lang: Locale;
  mode: SiteMode;
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
} satisfies Variants;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
} satisfies Variants;

export default function MediaGallerySection({
  block,
  lang: propLang,
  mode,
}: MediaGallerySectionProps) {
  const params = useParams();
  const lang = propLang || (params?.lang as string) || 'en';
  const alignClass = getAlignmentClass(block.heading?.align);
  const isCentered = block.heading?.align === 'center';
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const useLiteMotion = isInitialized && !allowHeavyMotion;
  const variants = useLiteMotion ? undefined : itemVariants;
  const mediaClassName = useLiteMotion
    ? 'object-cover transition-none'
    : 'object-cover transition-transform duration-700 ease-out group-hover:scale-105';

  return (
    <SectionShell background={block.background} sanityType={block._type}>
      <div className="container mx-auto space-y-12">
        <header
          className={cn(
            'flex flex-col gap-4 text-balance',
            alignClass,
            isCentered && 'mx-auto text-center'
          )}
        >
          {block.heading?.eyebrow ? (
            <span className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
              {block.heading.eyebrow}
            </span>
          ) : null}
          {block.heading?.heading ? (
            <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl">
              {block.heading.heading}
            </h2>
          ) : null}
          {block.heading?.body ? (
            <p className="text-muted-foreground max-w-3xl text-lg leading-relaxed font-light wrap-break-word">
              {block.heading.body}
            </p>
          ) : null}
        </header>

        {block.items?.length ? (
          <m.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={useLiteMotion ? undefined : containerVariants}
            transition={useLiteMotion ? { duration: 0.2 } : undefined}
          >
            {block.items.map((item, index) => {
              const key = item._key ?? index;

              if (item.mediaType === 'video' && item.videoUrl) {
                return (
                  <GalleryCard
                    key={key}
                    variants={variants}
                    useLiteMotion={useLiteMotion}
                    label={item.label}
                    testId="gallery-item-video"
                  >
                    <VideoItem
                      src={item.videoUrl}
                      className={
                        useLiteMotion
                          ? 'transition-none'
                          : 'transition-transform duration-700 ease-out group-hover:scale-105'
                      }
                    />
                  </GalleryCard>
                );
              }

              const image = item.media?.image;
              if (!image) {
                return null;
              }

              const card = (
                <GalleryCard
                  variants={variants}
                  useLiteMotion={useLiteMotion}
                  label={item.label}
                  testId={
                    item.projectSlug
                      ? 'gallery-item-project'
                      : 'gallery-item-image'
                  }
                  extra={
                    item.projectOverview ? (
                      <p className="text-muted-foreground/90 px-1 pb-1 text-sm">
                        {item.projectOverview}
                      </p>
                    ) : undefined
                  }
                >
                  <Image
                    src={urlFor(image).width(800).height(600).quality(90).url()}
                    alt={item.media?.alt ?? item.label ?? 'Gallery item'}
                    fill
                    className={mediaClassName}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </GalleryCard>
              );

              if (item.projectSlug) {
                return (
                  <Link
                    key={key}
                    href={`/${lang}/work/${item.projectSlug}`}
                    className="block"
                    aria-label={item.label ?? item.projectSlug}
                  >
                    {card}
                  </Link>
                );
              }

              return <div key={key}>{card}</div>;
            })}
          </m.div>
        ) : null}

        <CtaGroup
          ctas={block.cta ? [block.cta] : undefined}
          lang={lang}
          mode={mode}
          alignment={block.heading?.align}
        />
      </div>
    </SectionShell>
  );
}
