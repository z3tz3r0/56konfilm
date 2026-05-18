import { CtaGroup, ImageWithFrame, SectionShell } from '@shared/components';
import { TwoColumnByMode } from '../types';
import { cn, getBGVariants } from '@shared/utils';
import { urlFor } from '@/sanity/lib/image';

export default function Wedding({
  block,
  lang,
  mode,
  isTextLeft,
}: TwoColumnByMode) {
  const bgClass = getBGVariants(block.background);
  return (
    <SectionShell disablePadding sanityType={block._type}>
      {/* 🎨 Background Layer */}
      <div
        className={cn(
          'absolute top-0 -z-1 h-[90%] w-full md:max-w-[60%]',
          isTextLeft ? 'left-0' : 'right-0',
          bgClass
        )}
      />

      {/* 📦 Content Layer */}
      <div
        className={cn(
          'mb-16 flex w-full flex-col gap-8 px-4 pt-16 md:gap-0 md:px-14',
          isTextLeft ? 'md:flex-row' : 'md:flex-row-reverse'
        )}
      >
        {/* 📝 ฝั่งข้อความ */}
        <section
          className={cn(
            'flex w-full flex-col gap-8 md:w-[48.6%]',
            !isTextLeft && 'pl-8'
          )}
        >
          <div className="flex flex-col gap-4">
            {block.content?.eyebrow && (
              <span className="text-primary font-primary text-xl font-bold wrap-break-word uppercase md:text-2xl">
                {block.content.eyebrow}
              </span>
            )}
            {block.content?.heading && (
              <h2 className="text-3xl text-balance md:text-4xl">
                {block.content.heading}
              </h2>
            )}
            {block.content?.body && (
              <p className="text-muted-foreground text-base leading-relaxed text-pretty wrap-break-word">
                {block.content.body}
              </p>
            )}
          </div>
          <CtaGroup
            ctas={block.ctas}
            lang={lang}
            mode={mode}
            alignment={block.content?.align}
            className="pt-4 md:max-w-xs"
            fullWidth
          />
        </section>

        {/* 🖼️ ฝั่งรูปภาพ */}
        {block.media?.image && (
          <ImageWithFrame
            src={urlFor(block.media.image).quality(80).fit('clip').url()}
            alt={block.media.alt ?? ''}
            className="flex-1"
          />
        )}
      </div>
    </SectionShell>
  );
}
