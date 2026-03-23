import { cn, getJustifyClass } from '@shared/utils';
import { ContentCta } from '@shared/types';
import { CtaButton } from '@shared/components';
import { Locale, SiteMode } from '@shared/config';

interface CtaGroupProps {
  ctas?: ContentCta[];
  lang?: Locale;
  mode: SiteMode;
  className?: string;
  alignment?: string;
  fullWidth?: boolean;
}

export default function CtaGroup({
  ctas,
  lang,
  mode,
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
        fullWidth
          ? 'flex w-full flex-col items-stretch gap-3'
          : 'flex flex-wrap gap-3',
        justifyClass,
        className
      )}
    >
      {ctas.map((cta) => (
        <CtaButton
          key={cta.externalUrl ?? cta.pageRef?.slug ?? cta.label}
          cta={cta}
          lang={lang}
          mode={mode}
          className={className}
          fullWidth={!!fullWidth}
        />
      ))}
    </div>
  );
}
