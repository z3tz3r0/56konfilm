import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CtaGroup,
  SectionHeader,
  SectionShell,
} from '@shared/components';
import type { TimelineSectionBlock } from './types';
import type { Locale, SiteMode } from '@shared/config/preferences';
import TimelineCard from './components/TimelineCard';
import DesktopAnimatedTimeline from './components/desktop-animated-timeline';

interface TimelineSectionProps {
  block: TimelineSectionBlock;
  lang: Locale;
  mode: SiteMode;
}

/** Render sorted steps in desktop and mobile layouts using one section icon toggle. */
export default function TimelineSection({
  block,
  lang,
  mode,
}: TimelineSectionProps) {
  const hasIcon = block.hasIcon === true;
  const steps = [...(block.steps ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <SectionShell background={block.background} dataTestId='timeline-section'>
      <div className='container mx-auto space-y-12'>
        <SectionHeader heading={block.heading} />

        {steps.length ? (
          <div className='relative isolate mx-auto mt-8 md:mt-16'>
            {/* --- Desktop Layout (Zig-Zag) --- */}
            <DesktopAnimatedTimeline steps={steps} hasIcon={hasIcon} />

            {/* --- Mobile Layout (Carousel) --- */}
            <div className='block md:hidden' data-testid='timeline-mobile'>
              <Carousel
                opts={{ align: 'start', loop: false }}
                className='w-full'
              >
                <CarouselContent>
                  {steps.map((step, index) => (
                    <CarouselItem
                      key={step._key ?? index}
                      className='basis-[85%] pl-4'
                    >
                      <TimelineCard
                        step={step}
                        index={index}
                        hasIcon={hasIcon}
                        className='h-full min-h-[280px]'
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        ) : null}
        <div className='mx-auto w-full'>
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
