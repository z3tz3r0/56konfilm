
import CtaGroup from '@/components/page/CtaGroup';
import SectionShell from '@/components/page/SectionShell';
import { getAlignmentClass } from '@/components/page/utils';
import { cn } from '@/lib/utils';
import { CtaBannerSectionBlock } from '@/types/sanity';

interface CtaBannerSectionProps {
  block: CtaBannerSectionBlock;
}

export default function CtaBannerSection({ block }: CtaBannerSectionProps) {
  // const isTextLeft = block.layout !== 'textRight';
  const alignClass = getAlignmentClass(block.content?.align);

  // Overlay Logic
  const overlayEnabled = block.overlay?.enabled ?? true; // Default to true if undefined
  const overlayColor = block.overlay?.color?.hex ?? '#000000';
  const overlayOpacity = (block.overlay?.opacity ?? 60) / 100;

  const overlayStyle = overlayEnabled 
    ? { backgroundColor: overlayColor, opacity: overlayOpacity }
    : undefined;

  // If overlay is explicitly disabled in new schema, we don't want the default class either.
  // But if block.overlay is undefined (old data), we kept the default behavior in previous step? 
  // Actually, let's strictly follow the explicit configuration if present, 
  // otherwise fallback to the "Premium Design" default we just established (bg-black/60).
  
  // Refined Logic:
  // 1. If block.overlay exists -> use its settings.
  // 2. If block.overlay is missing -> use default 'bg-black/60'.
  
  const finalOverlayStyle = block.overlay ? overlayStyle : undefined;
  const finalOverlayClass = block.overlay ? undefined : "bg-black/60";

  // Hide overlay if enabled is explicitly false
  if (block.overlay && !block.overlay.enabled) {
      // Pass nothing or display none logic handled by SectionShell? 
      // SectionShell renders if overlayClassName OR overlayStyle is present.
      // So if enabled is false, we ensure both are undefined.
  }

  return (
    <SectionShell 
      background={block.background} 
      className="py-24 md:py-32"
      media={block.media?.image ? [{ _type: 'image', image: block.media.image }] : undefined}
      overlayClassName={block.overlay?.enabled === false ? undefined : finalOverlayClass}
      overlayStyle={block.overlay?.enabled === false ? undefined : finalOverlayStyle}
    >
      <div className="container mx-auto relative z-10">
        <div className={cn('flex flex-col gap-6 max-w-4xl mx-auto', alignClass)}>
          {block.content?.eyebrow ? (
            <span 
              className="text-sm font-semibold uppercase tracking-[0.2em] text-primary"
              style={{ color: block.customColors?.eyebrow?.hex }}
            >
              {block.content.eyebrow}
            </span>
          ) : null}
          {block.content?.heading ? (
            <h2 
              className="text-4xl font-semibold md:text-5xl md:leading-tight"
              style={{ color: block.customColors?.heading?.hex }}
            >
              {block.content.heading}
            </h2>
          ) : null}
          {block.content?.body ? (
            <p 
              className="max-w-2xl text-lg text-muted-foreground"
              style={{ color: block.customColors?.body?.hex }}
            >
              {block.content.body}
            </p>
          ) : null}
          <CtaGroup ctas={block.ctas} alignment={block.content?.align} />
        </div>
      </div>
    </SectionShell>
  );
}
