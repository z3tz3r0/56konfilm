import { getImageUrl, THUMBNAIL_IMAGE } from '@/sanity/lib/image';
import { TimelineStep } from '@features/timeline-section/types';
import { Card, CardContent } from '@shared/components';
import { cn } from '@shared/utils';
import Image from 'next/image';

export default function TimelineCard({
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
        'group border-steel-gray bg-card hover:border-primary relative flex h-full flex-col overflow-hidden p-6 transition-colors duration-200 md:p-8',
        className
      )}
    >
      <CardContent className='flex flex-1 flex-col justify-start'>
        {/* Big Faded Number (Background) */}
        <span
          aria-hidden='true'
          className='text-charcoal-gray group-hover:text-primary/20 absolute right-[50%] bottom-[50%] translate-x-[50%] translate-y-[50%] text-[10rem] leading-none font-bold transition-colors duration-200 select-none lg:right-4 lg:translate-x-0'
        >
          {step.order ?? index + 1}
        </span>

        {/* Header with Icon */}
        <div className='relative z-10 flex flex-col gap-4'>
          {step.icon ? (
            <div className='relative size-12 shrink-0'>
              <Image
                src={getImageUrl(step.icon, THUMBNAIL_IMAGE)}
                alt=''
                fill
                className='object-contain'
                sizes='48px'
              />
            </div>
          ) : null}

          {step.title ? (
            <h3 className='group-hover:text-primary text-center text-4xl font-bold wrap-break-word transition-colors duration-200 lg:text-start'>
              {step.title}
            </h3>
          ) : null}
        </div>

        {step.description ? (
          <p className='text-muted-foreground relative z-10 mt-4 text-base leading-relaxed'>
            {step.description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
