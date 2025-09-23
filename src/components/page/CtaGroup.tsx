import { cn } from '@/lib/utils';
import { ContentCta } from '@/types/sanity';

import { getJustifyClass } from './utils';
import CtaButton from './CtaButton';

interface CtaGroupProps {
  ctas?: ContentCta[];
  alignment?: string;
}

export default function CtaGroup({ ctas, alignment }: CtaGroupProps) {
  if (!ctas?.length) {
    return null;
  }

  const justifyClass = getJustifyClass(alignment);

  return (
    <div className={cn('flex flex-wrap gap-3', justifyClass)}>
      {ctas.map((cta, index) => (
        <CtaButton key={`${cta.label ?? 'cta'}-${index}`} cta={cta} />
      ))}
    </div>
  );
}
