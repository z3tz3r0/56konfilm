import {
  Card,
  CardContent,
  Carousel,
  CarouselContent,
  CarouselItem,
  CtaGroup,
  SectionHeader,
  SectionShell,
} from '@shared/components';
import { cn } from '@shared/utils';
import { getImageUrl, THUMBNAIL_IMAGE } from '@/sanity/lib/image';
import { TimelineSectionBlock } from '../types';
import Image from 'next/image';
import { Locale, SiteMode } from '@shared/config';

interface TimelineSectionProps {
  block: TimelineSectionBlock;
  lang: Locale;
  mode: SiteMode;
}
type TimelineStep = NonNullable<TimelineSectionBlock['steps']>[number];

export default function TimelineSection({
  block,
  lang,
  mode,
}: TimelineSectionProps) {
  const steps = [...(block.steps ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <SectionShell background={block.background}>
      <div className="container mx-auto space-y-12">
        <SectionHeader heading={block.heading} />

        {steps.length ? (
          <div className="relative isolate mx-auto mt-8 md:mt-16">
            {/* --- Desktop Layout (Zig-Zag) --- */}
            <div className="hidden md:block">
              {/* Central Line */}
              <div
                aria-hidden="true"
                className="bg-primary absolute top-4 -bottom-6 left-1/2 w-px -translate-x-1/2"
              />

              <ol className="space-y-24">
                {steps.map((step, index) => {
                  const isEven = index % 2 === 0;

                  return (
                    <li
                      key={step._key ?? index}
                      className={cn(
                        'relative flex items-center md:gap-0',
                        isEven ? 'flex-row' : 'flex-row-reverse'
                      )}
                    >
                      {/* Content Box */}
                      <div
                        className={cn(
                          'relative w-1/2',
                          isEven ? 'pr-12' : 'pl-12'
                        )}
                      >
                        {/* Connector Line (Desktop Only) */}
                        <div
                          className={cn(
                            'bg-primary absolute top-1/2 -z-10 h-px w-12',
                            isEven ? 'right-0' : 'left-0'
                          )}
                        />

                        <TimelineCard step={step} index={index} />
                      </div>

                      {/* Marker (Center) - Empty Orange Dot */}
                      <div className="bg-primary ring-background absolute left-1/2 z-10 flex size-4 shrink-0 -translate-x-1/2 rounded-full shadow-sm ring-4" />

                      {/* Spacer Side */}
                      <div className="w-1/2" />
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* --- Mobile Layout (Carousel) --- */}
            <div className="block md:hidden">
              <Carousel
                opts={{ align: 'start', loop: false }}
                className="w-full"
              >
                <CarouselContent className="">
                  {steps.map((step, index) => (
                    <CarouselItem
                      key={step._key ?? index}
                      className="basis-[85%] pl-4"
                    >
                      <TimelineCard
                        step={step}
                        index={index}
                        className="h-full min-h-[280px]"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        ) : null}
        <div className="mx-auto w-full">
          <CtaGroup
            ctas={block.cta ? [block.cta] : undefined}
            lang={lang}
            mode={mode}
            alignment={block.heading?.align}
          />
        </div>
      </div>
    </SectionShell>
  );
}

// Reusable Card Component
function TimelineCard({
  step,
  index,
  className,
}: {
  step: TimelineStep;
  index: number;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        'border-steel-gray bg-card hover:border-steel-gray/50 relative flex h-full flex-col overflow-hidden p-6 transition md:p-8',
        className
      )}
    >
      <CardContent className="flex flex-1 flex-col justify-start">
        {/* Big Faded Number (Background) */}
        <span className="text-charcoal-gray absolute right-4 bottom-[50%] translate-y-[50%] text-[10rem] leading-none font-bold select-none">
          {step.order ?? index + 1}
        </span>

        {/* Header with Icon */}
        <div className="relative z-10 flex flex-col gap-4">
          {step.icon ? (
            <div className="relative size-12 shrink-0">
              <Image
                src={getImageUrl(step.icon, THUMBNAIL_IMAGE)}
                alt=""
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
          ) : null}

          {step.title ? (
            <h3 className="text-2xl font-bold md:text-3xl">{step.title}</h3>
          ) : null}
        </div>

        {step.description ? (
          <p className="text-muted-foreground relative z-10 mt-4 text-base leading-relaxed">
            {step.description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
