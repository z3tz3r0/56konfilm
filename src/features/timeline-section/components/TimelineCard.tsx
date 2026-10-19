import type { TimelineStep } from '@features/timeline-section/types';
import { AppIcon, Card, CardContent } from '@shared/components';
import { cn } from '@shared/utils/styling/tailwindUtils';

/**
 * Render a numbered step with a decorative picker icon when enabled by its section.
 * Missing or blank icon names leave no icon slot; legacy images are not rendered.
 */
export default function TimelineCard({
  step,
  index,
  hasIcon = false,
  className,
}: {
  step: TimelineStep;
  index: number;
  hasIcon?: boolean;
  className?: string;
}) {
  const iconName =
    typeof step.iconPicker?.name === 'string'
      ? step.iconPicker.name.trim()
      : '';
  const showIcon = hasIcon === true && Boolean(iconName);

  return (
    <Card
      data-testid='timeline-card'
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
        <div
          className={cn(
            'relative z-10 flex flex-col gap-4',
            showIcon && 'items-center md:flex-row'
          )}
        >
          {showIcon ? (
            <div aria-hidden='true' className='shrink-0'>
              <AppIcon iconName={iconName} variant='plain' />
            </div>
          ) : null}

          {step.title ? (
            <h3
              className={cn(
                'group-hover:text-primary text-center text-4xl font-bold wrap-break-word transition-colors duration-200 lg:text-start',
                showIcon && 'min-w-0 self-stretch md:flex-1 md:text-start'
              )}
            >
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
