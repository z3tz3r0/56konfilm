import SectionShell from '@/components/page/SectionShell';
import CtaGroup from '@/components/page/CtaGroup';
import { getAlignmentClass } from '@/components/page/utils';
import { cn } from '@/lib/utils';
import { TimelineSectionBlock } from '@/types/sanity';

interface TimelineSectionProps {
  block: TimelineSectionBlock;
}

export default function TimelineSection({ block }: TimelineSectionProps) {
  const alignClass = getAlignmentClass(block.heading?.align);
  const steps = [...(block.steps ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <SectionShell background={block.background}>
      <div className="container space-y-12">
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
          <ol className="relative grid gap-8 md:grid-cols-2">
            {steps.map((step, index) => (
              <li key={`${step.title ?? index}-${step.order}`} className="flex h-full flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {step.order ?? index + 1}
                  </div>
                  {step.title ? <h3 className="text-xl font-semibold">{step.title}</h3> : null}
                </div>
                {step.description ? <p className="text-sm text-muted-foreground">{step.description}</p> : null}
              </li>
            ))}
          </ol>
        ) : null}
        <CtaGroup ctas={block.cta ? [block.cta] : undefined} alignment={block.heading?.align} />
      </div>
    </SectionShell>
  );
}
