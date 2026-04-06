import { cn } from '@shared/utils';
import { getAlignmentClass } from '@shared/utils';
import type { SectionHeading } from '@shared/types';

interface SectionHeaderProps {
  heading?: SectionHeading;
  className?: string;
  headingClassName?: string;
  bodyClassName?: string;
}

export default function SectionHeader({
  heading,
  className,
  headingClassName,
  bodyClassName,
}: SectionHeaderProps) {
  if (!heading?.eyebrow && !heading?.heading && !heading?.body) return null;

  const alignClass = getAlignmentClass(heading?.align);

  return (
    <header className={cn('flex flex-col gap-3', alignClass, className)}>
      {heading?.eyebrow ? (
        <span className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
          {heading.eyebrow}
        </span>
      ) : null}
      {heading?.heading ? (
        <h2
          className={cn('text-3xl font-semibold md:text-4xl', headingClassName)}
        >
          {heading.heading}
        </h2>
      ) : null}
      {heading?.body ? (
        <p
          className={cn(
            'text-muted-foreground max-w-3xl text-base leading-relaxed',
            bodyClassName
          )}
        >
          {heading.body}
        </p>
      ) : null}
    </header>
  );
}
