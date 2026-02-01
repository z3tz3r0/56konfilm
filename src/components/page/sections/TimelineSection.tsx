import CtaGroup from '@/components/page/CtaGroup';
import SectionShell from '@/components/page/SectionShell';
import { getAlignmentClass } from '@/components/page/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { urlFor } from '@/sanity/lib/image';
import { TimelineSectionBlock } from '@/types/sanity';
import Image from 'next/image';

interface TimelineSectionProps {
  block: TimelineSectionBlock;
}

export default function TimelineSection({ block }: TimelineSectionProps) {
  const alignClass = getAlignmentClass(block.heading?.align);
  const steps = [...(block.steps ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <SectionShell background={block.background}>
      <div className="container mx-auto max-w-5xl space-y-12">
        <header className={cn('flex flex-col gap-3', alignClass)}>
          {block.heading?.eyebrow ? (
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {block.heading.eyebrow}
            </span>
          ) : null}
          {block.heading?.heading ? (
            <h2 className="text-3xl font-semibold md:text-4xl">{block.heading.heading}</h2>
          ) : null}
          {block.heading?.body ? (
            <p className="max-w-3xl text-base text-muted-foreground">{block.heading.body}</p>
          ) : null}
        </header>

        {steps.length ? (
          <div className="relative isolate mt-8 md:mt-16">
            
            {/* --- Desktop Layout (Zig-Zag) --- */}
            <div className="hidden md:block">
              {/* Central Line */}
              <div 
                aria-hidden="true" 
                className="absolute left-1/2 top-4 -bottom-6 w-px -translate-x-1/2 bg-primary" 
              />

              <ol className="space-y-24">
                {steps.map((step, index) => {
                  const isEven = index % 2 === 0;
                  
                  return (
                    <li 
                      key={step._key ?? index} 
                      className={cn(
                        "relative flex items-center md:gap-0",
                        isEven ? "flex-row" : "flex-row-reverse"
                      )}
                    >
                      {/* Content Box */}
                      <div 
                        className={cn(
                          "relative w-1/2",
                          isEven ? "pr-12" : "pl-12"
                        )}
                      >
                         {/* Connector Line (Desktop Only) */}
                         <div 
                           className={cn(
                             "absolute top-1/2 -z-10 h-px w-12 bg-primary",
                             isEven ? "right-0" : "left-0"
                           )} 
                         />

                        <TimelineCard step={step} index={index} className="min-h-[280px]" />
                      </div>

                      {/* Marker (Center) - Empty Orange Dot */}
                      <div className="absolute left-1/2 z-10 flex size-4 shrink-0 -translate-x-1/2 rounded-full bg-primary shadow-sm ring-4 ring-background" />

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
                    <CarouselItem key={step._key ?? index} className="pl-4 basis-[85%]">
                       <TimelineCard step={step} index={index} className="h-full min-h-[280px]" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

          </div>
        ) : null}
        <CtaGroup ctas={block.cta ? [block.cta] : undefined} alignment={block.heading?.align} />
      </div>
    </SectionShell>
  );
}

// Reusable Card Component
function TimelineCard({ step, index, className }: { step: any; index: number; className?: string }) {
  return (
    <Card className={cn("relative flex h-full flex-col overflow-hidden border-border/10 bg-card transition hover:border-primary/20", className)}>
      <CardContent className="flex flex-1 flex-col justify-start p-6 md:p-8">
        {/* Big Faded Number (Background) */}
        <span className="absolute bottom-[-1rem] right-4 select-none text-[8rem] font-bold leading-none text-foreground opacity-10">
          {step.order ?? index + 1}
        </span>

        {/* Header with Icon */}
        <div className="relative z-10 flex flex-col gap-4">
          {step.icon ? (
            <div className="relative size-12 shrink-0">
               <Image 
                 src={urlFor(step.icon).width(96).height(96).fit('clip').url()} 
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
          <p className="relative z-10 mt-4 text-muted-foreground text-base leading-relaxed">
            {step.description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
