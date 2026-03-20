import dynamic from 'next/dynamic';
import { HeroSection } from '@features/hero-section/components';
import { PageContentBlock, PageDocument } from '@shared/types';
import { Locale, SiteMode } from '@shared/config';

const TwoColumnSection = dynamic(
  () => import('@features/two-column-section/components/TwoColumnSection')
);
const CardCollectionSection = dynamic(
  () =>
    import('@features/card-collection-section/components/CardCollectionSection')
);
const TimelineSection = dynamic(
  () => import('@features/timeline-section/components/TimelineSection')
);
const LogoGridSection = dynamic(
  () => import('@features/logo-grid-section/components/LogoGridSection')
);
const CtaBannerSection = dynamic(
  () => import('@features/cta-banner-section/components/CtaBannerSection')
);
const MediaGallerySection = dynamic(
  () => import('@features/media-gallery-section/components/MediaGallerySection')
);
const PackagesSection = dynamic(
  () => import('@features/package-section/components/PackagesSection')
);
const TestimonialSection = dynamic(
  () => import('@features/testimonial-section/components/TestimonialSection')
);
const PhilosophySection = dynamic(
  () => import('@features/philosophy-section/components/PhilosophySection')
);

interface PageBuilderProps {
  page: PageDocument;
  lang: Locale;
  mode: SiteMode;
  metadata?: {
    client?: string;
    year?: string;
    services?: string[];
  };
  enableSignature?: boolean;
}

export default function PageBuilder({
  page,
  lang,
  mode,
  metadata,
  enableSignature,
}: PageBuilderProps) {
  const blocks = page.contentBlocks ?? [];
  const contentSignature = enableSignature ? hashBlocks(blocks) : undefined;

  if (!blocks.length) {
    return (
      <section className="py-16 md:py-24">
        <div className="border-border/60 bg-muted/20 text-muted-foreground rounded-2xl border p-12 text-center">
          เนื้อหาอยู่ระหว่างการจัดเตรียม กรุณากลับมาอีกครั้ง
        </div>
      </section>
    );
  }

  return (
    <div
      className="contents"
      data-testid="page-content"
      data-content-signature={contentSignature}
    >
      {blocks.map((block, index) =>
        renderBlock(block, index, lang, mode, metadata)
      )}
    </div>
  );
}

function renderBlock(
  block: PageContentBlock,
  index: number,
  lang: Locale,
  mode: SiteMode,
  metadata?: PageBuilderProps['metadata']
) {
  const key = block._key ?? `${block._type}-${index}`;

  switch (block._type) {
    case 'heroSection':
      return (
        <HeroSection key={key} block={block} lang={lang} metadata={metadata} />
      );
    case 'twoColumnSection':
      return <TwoColumnSection key={key} block={block} lang={lang} />;
    case 'cardCollectionSection':
      return (
        <CardCollectionSection
          key={key}
          block={block}
          lang={lang}
          mode={mode}
        />
      );
    case 'timelineSection':
      return <TimelineSection key={key} block={block} lang={lang} />;
    case 'mediaGallerySection':
      return <MediaGallerySection key={key} block={block} lang={lang} />;
    case 'logoGridSection':
      return <LogoGridSection key={key} block={block} />;
    case 'ctaBannerSection':
      return <CtaBannerSection key={key} block={block} lang={lang} />;
    case 'packagesSection':
      return (
        <PackagesSection key={key} block={block} lang={lang} mode={mode} />
      );
    case 'testimonialSection':
      return <TestimonialSection key={key} block={block} />;
    case 'philosophySection':
      return <PhilosophySection key={key} block={block} />;
    default:
      return null;
  }
}

function hashBlocks(blocks: PageContentBlock[]) {
  const raw = blocks.map((block) => JSON.stringify(block)).join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return `v1:${hash}`;
}
