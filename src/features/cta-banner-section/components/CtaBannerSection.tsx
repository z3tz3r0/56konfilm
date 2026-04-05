import { CtaGroup, SectionShell } from '@shared/components';
import { cn, getAlignmentClass } from '@shared/utils';
import { CtaBannerSectionBlock } from '../types';
import { Locale, SiteMode } from '@shared/config';

interface CtaBannerSectionProps {
  block: CtaBannerSectionBlock;
  lang: Locale;
  mode: SiteMode;
}

function getOverlayConfig(overlay?: CtaBannerSectionBlock['overlay']) {
  // Explicitly disabled
  if (overlay?.enabled === false) return {};
  // Custom overlay settings from CMS
  if (overlay) {
    return {
      overlayStyle: {
        backgroundColor: overlay.color?.hex ?? '#000000',
        opacity: (overlay.opacity ?? 60) / 100,
      },
    };
  }
  // No overlay config → default dark overlay
  return { overlayClassName: 'bg-black/60' };
}

export default function CtaBannerSection({
  block,
  lang,
  mode,
}: CtaBannerSectionProps) {
  const alignClass = getAlignmentClass(block.content?.align);
  const overlay = getOverlayConfig(block.overlay);

  return (
    <SectionShell
      background={block.background}
      media={
        block.media?.image
          ? [{ _type: 'image', image: block.media.image }]
          : undefined
      }
      overlayClassName={overlay.overlayClassName}
      overlayStyle={overlay.overlayStyle}
    >
      <div className="relative z-10 container mx-auto">
        <div className={cn('mx-auto flex flex-col gap-6', alignClass)}>
          {block.content?.eyebrow ? (
            <span
              className="text-primary text-sm font-semibold tracking-[0.2em] uppercase"
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
              className="text-muted-foreground max-w-2xl text-lg"
              style={{ color: block.customColors?.body?.hex }}
            >
              {block.content.body}
            </p>
          ) : null}
          <CtaGroup
            ctas={block.ctas}
            lang={lang}
            mode={mode}
            alignment={block.content?.align}
          />
        </div>
      </div>
    </SectionShell>
  );
}
