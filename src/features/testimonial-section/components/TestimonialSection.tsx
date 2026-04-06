'use client';

import { useEffect, useState } from 'react';
import { m } from 'motion/react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  SectionHeader,
  SectionShell,
  type CarouselApi,
} from '@shared/components';
import { fadeUpItemVariants } from '@shared/lib/motion';
import { cn } from '@shared/utils';
import { getImageUrl, THUMBNAIL_IMAGE } from '@/sanity/lib/image';
import { TestimonialSectionBlock } from '../types';

interface TestimonialSectionProps {
  block: TestimonialSectionBlock;
}

export default function TestimonialSection({ block }: TestimonialSectionProps) {
  const defaultBackground = !block.background || block.background === 'default';
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const count = block.testimonials?.length ?? 0;

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  return (
    <SectionShell
      background={block.background}
      sanityType={block._type}
      dataTestId="testimonial-section"
      className={cn(defaultBackground && 'bg-background')}
    >
      <div className="container mx-auto max-w-5xl space-y-10">
        <SectionHeader
          heading={block.heading}
          className="mx-auto max-w-3xl items-center text-center"
          headingClassName="md:text-5xl"
        />

        {block.testimonials?.length ? (
          <div className="relative">
            <Carousel opts={{ align: 'start', loop: true }} setApi={setApi}>
              <CarouselContent>
                {block.testimonials.map((testimonial, index) => (
                  <CarouselItem key={testimonial._key ?? index}>
                    <m.article
                      className={cn(
                        'bg-secondary/80 border-border/40 mx-auto flex max-w-3xl flex-col gap-6 rounded-3xl border p-8 text-center shadow-sm transition-opacity duration-500',
                        index === current
                          ? 'opacity-100'
                          : 'pointer-events-none opacity-0'
                      )}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-100px' }}
                      variants={fadeUpItemVariants}
                      data-testid={
                        index === current ? 'testimonial-item' : undefined
                      }
                    >
                      <div className="text-primary flex items-center justify-center text-5xl">
                        “
                      </div>
                      {testimonial.quote ? (
                        <p
                          className="text-foreground text-lg leading-relaxed"
                          style={{
                            fontFamily:
                              'var(--font-primary), "Cormorant Garamond", var(--font-noto-sans-thai), serif',
                          }}
                        >
                          {testimonial.quote}
                        </p>
                      ) : null}
                      <div className="flex flex-col items-center gap-2">
                        {testimonial.authorImage ? (
                          <div className="border-border/60 relative size-12 overflow-hidden rounded-full border">
                            <Image
                              src={getImageUrl(
                                testimonial.authorImage,
                                THUMBNAIL_IMAGE
                              )}
                              alt={testimonial.authorName ?? 'Author'}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : null}
                        {testimonial.authorName ? (
                          <p className="text-base font-semibold">
                            {testimonial.authorName}
                          </p>
                        ) : null}
                        {testimonial.authorTitle ? (
                          <p className="text-muted-foreground text-sm">
                            {testimonial.authorTitle}
                          </p>
                        ) : null}
                      </div>
                    </m.article>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious
                data-testid="carousel-prev"
                className="bg-[var(--color-brown)] text-[var(--color-ivory-white)] hover:bg-[var(--color-mocha-brown)]"
              />
              <CarouselNext
                data-testid="carousel-next"
                className="bg-[var(--color-brown)] text-[var(--color-ivory-white)] hover:bg-[var(--color-mocha-brown)]"
              />
            </Carousel>

            {count > 1 ? (
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    aria-label={`Go to testimonial ${index + 1}`}
                    className={cn(
                      'h-2.5 w-2.5 rounded-full transition',
                      index === current
                        ? 'bg-[var(--color-brown)]'
                        : 'bg-[var(--color-light-brown)]/50'
                    )}
                    onClick={() => api?.scrollTo(index)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
