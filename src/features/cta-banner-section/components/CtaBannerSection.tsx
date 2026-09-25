import { CtaGroup, HighlightedText, SectionShell } from '@shared/components';
import { cn, getAlignmentClass } from '@shared/utils';
import { CtaBannerSectionBlock } from '../types';
import { Locale, SiteMode } from '@shared/config';

interface CtaBannerSectionProps {
  block: CtaBannerSectionBlock;
  lang: Locale;
  mode: SiteMode;
}

function getOverlayConfig(
  overlay: CtaBannerSectionBlock['overlay'],
  mode: SiteMode,
  align?: string
) {
  // Explicitly disabled
  if (overlay?.enabled === false) return {};
  // Custom overlay settings from CMS
  if (overlay) {
    return {
      overlayStyle: {
        backgroundColor: overlay.color?.hex ?? 'var(--color-midnight-black)',
        opacity: (overlay.opacity ?? 60) / 100,
      },
    };
  }
  // Use the Figma gradient only when Production has no CMS overlay settings.
  if (mode === 'production') {
    return {
      overlayClassName:
        align === 'end'
          ? 'bg-linear-to-l from-midnight-black/50 from-50% to-midnight-black/0'
          : 'bg-linear-to-r from-midnight-black/50 from-50% to-midnight-black/0',
    };
  }

  return { overlayClassName: 'bg-midnight-black/60' };
}

export default function CtaBannerSection({
  block,
  lang,
  mode,
}: CtaBannerSectionProps) {
  const isProduction = mode === 'production';
  const hasImage = Boolean(block.media?.image);
  const alignClass = getAlignmentClass(block.content?.align);
  const overlay = getOverlayConfig(block.overlay, mode, block.content?.align);
  const ctaGroup = (
    <CtaGroup
      ctas={block.ctas}
      lang={lang}
      mode={mode}
      alignment={block.content?.align}
    />
  );

  const section = (
    <SectionShell
      background={block.background}
      media={
        block.media?.image
          ? [{ _type: 'image', image: block.media.image }]
          : undefined
      }
      overlayClassName={overlay.overlayClassName}
      overlayStyle={overlay.overlayStyle}
      disablePadding={isProduction}
      className={cn(isProduction && 'rounded-4xl px-6 py-12 md:px-14 md:py-16')}
    >
      <div className='relative z-10 container mx-auto'>
        <div
          className={cn(
            'mx-auto flex flex-col',
            isProduction ? 'gap-4' : 'gap-6',
            alignClass
          )}
        >
          {block.content?.eyebrow ? (
            <span className='text-primary text-sm font-semibold tracking-[0.2em] uppercase'>
              {block.content.eyebrow}
            </span>
          ) : null}
          {block.content?.heading ? (
            <HighlightedText
              text={block.content.heading}
              className={cn(
                'text-4xl font-semibold md:text-5xl md:leading-tight',
                isProduction && 'font-bold',
                isProduction && hasImage && 'text-foreground'
              )}
            />
          ) : null}
          {block.content?.body ? (
            <p
              className={cn(
                'text-muted-foreground text-lg',
                isProduction ? 'w-full md:w-2/3 md:text-2xl' : 'max-w-2xl',
                isProduction && hasImage && 'text-foreground'
              )}
            >
              {block.content.body}
            </p>
          ) : null}
          {isProduction && block.ctas?.length ? (
            <div className='w-full pt-4'>{ctaGroup}</div>
          ) : (
            ctaGroup
          )}
        </div>
      </div>
    </SectionShell>
  );

  return isProduction ? (
    <div className='mx-auto w-full px-4 py-16 lg:px-14'>{section}</div>
  ) : (
    section
  );
}
