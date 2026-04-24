import dynamic from 'next/dynamic';
import { PageDocument } from '@shared/types';
import { SectionErrorBoundary } from '@shared/components';
import { HeroSection, type HeroSectionBlock } from './hero-section';
import { TwoColumnSectionBlock } from './two-column-section/types';
import { CardCollectionSectionBlock } from './card-collection-section/types';
import { TimelineSectionBlock } from './timeline-section/types';
import { MediaGallerySectionBlock } from './media-gallery-section/types';
import { LogoGridSectionBlock } from './logo-grid-section/types';
import { CtaBannerSectionBlock } from './cta-banner-section/types';
import { PackagesSectionBlock } from './package-section/types';
import { TestimonialSectionBlock } from './testimonial-section/types';
import { PhilosophySectionBlock } from './philosophy-section/types';
import { Locale, SiteMode } from '@shared/config';

const TwoColumnSection = dynamic(
  () => import('@features/two-column-section/components/TwoColumnSection')
);
const CardCollectionSection = dynamic(
  () => import('@features/card-collection-section/CardCollectionSection')
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

type PageContentBlock =
  | HeroSectionBlock
  | TwoColumnSectionBlock
  | CardCollectionSectionBlock
  | TimelineSectionBlock
  | MediaGallerySectionBlock
  | LogoGridSectionBlock
  | CtaBannerSectionBlock
  | PackagesSectionBlock
  | TestimonialSectionBlock
  | PhilosophySectionBlock;

type FullPageDocument = PageDocument<PageContentBlock>;

interface PageBuilderProps {
  page: FullPageDocument | null;
  lang: Locale;
  mode: SiteMode;
  metadata?: {
    client?: string;
    year?: string;
    services?: string[];
  };
  enableSignature?: boolean;
}

function PageBuilder({
  page,
  lang,
  mode,
  metadata,
  enableSignature,
}: PageBuilderProps) {
  const blocks = page?.contentBlocks ?? [];
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
      {blocks.map((block, index) => (
        <SectionErrorBoundary
          key={block._key ?? `${block._type}-${index}`}
          sectionType={block._type}
        >
          {renderBlock(block, index, lang, mode, metadata)}
        </SectionErrorBoundary>
      ))}
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
        <HeroSection
          key={key}
          block={block}
          lang={lang}
          mode={mode}
          metadata={metadata}
        />
      );
    case 'twoColumnSection':
      return (
        <TwoColumnSection key={key} block={block} lang={lang} mode={mode} />
      );
    case 'cardCollectionSection':
      return <CardCollectionSection key={key} block={block} mode={mode} />;
    case 'timelineSection':
      return (
        <TimelineSection key={key} block={block} lang={lang} mode={mode} />
      );
    case 'mediaGallerySection':
      return (
        <MediaGallerySection key={key} block={block} lang={lang} mode={mode} />
      );
    case 'logoGridSection':
      return <LogoGridSection key={key} block={block} />;
    case 'ctaBannerSection':
      return (
        <CtaBannerSection key={key} block={block} lang={lang} mode={mode} />
      );
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

export default PageBuilder;
export type { PageContentBlock, FullPageDocument };
