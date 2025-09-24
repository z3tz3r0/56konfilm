import { cn } from '@/lib/utils';
import { ContentCta } from '@/types/sanity';

import CtaButton from './CtaButton';
import { getJustifyClass } from './utils';

interface CtaGroupProps {
  ctas?: ContentCta[];
  className?: string;
  alignment?: string;
  fullWidth?: boolean;
}

export default function CtaGroup({
  ctas,
  alignment,
  className,
  fullWidth,
}: CtaGroupProps) {
  if (!ctas?.length) {
    return null;
  }

  const justifyClass = getJustifyClass(alignment);

  return (
    <div
      className={cn(
        fullWidth ? 'flex w-full flex-col items-stretch gap-3' : 'flex flex-wrap gap-3',
        justifyClass,
        className
      )}
    >
      {ctas.map((cta, index) => (
        <CtaButton
          key={`${cta.label ?? 'cta'}-${index}`}
          cta={cta}
          className={className}
          fullWidth={!!fullWidth}
        />
      ))}
    </div>
  );
}
