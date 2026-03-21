import dynamic from 'next/dynamic';

import HeroSection from '@/components/page/sections/HeroSection';
import { PageContentBlock, PageDocument } from '@/types/sanity';

const TwoColumnSection = dynamic(
  () => import('@/components/page/sections/TwoColumnSection')
);
const CardCollectionSection = dynamic(
  () => import('@/components/page/sections/CardCollectionSection')
);
const TimelineSection = dynamic(
  () => import('@/components/page/sections/TimelineSection')
);
const LogoGridSection = dynamic(
  () => import('@/components/page/sections/LogoGridSection')
);
const CtaBannerSection = dynamic(
  () => import('@/components/page/sections/CtaBannerSection')
);
const MediaGallerySection = dynamic(
  () => import('@/components/page/sections/MediaGallerySection')
);
const PackagesSection = dynamic(
  () => import('@/components/page/sections/PackagesSection')
);
const TestimonialSection = dynamic(
  () => import('@/components/page/sections/TestimonialSection')
);
const PhilosophySection = dynamic(
  () => import('@/components/page/sections/PhilosophySection')
);

interface PageBuilderProps {
  page: PageDocument;
  lang: string;
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
  metadata,
  enableSignature,
}: PageBuilderProps) {
  const blocks = page.contentBlocks ?? [];
  const contentSignature = enableSignature ? hashBlocks(blocks) : undefined;

  if (!blocks.length) {
    return (
      <section className="container py-16 md:py-24">
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
      {blocks.map((block, index) => renderBlock(block, index, lang, metadata))}
    </div>
  );
}

function renderBlock(
  block: PageContentBlock,
  index: number,
  lang: string,
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
      return <CardCollectionSection key={key} block={block} lang={lang} />;
    case 'timelineSection':
      return <TimelineSection key={key} block={block} lang={lang} />;
    case 'mediaGallerySection':
      return <MediaGallerySection key={key} block={block} lang={lang} />;
    case 'logoGridSection':
      return <LogoGridSection key={key} block={block} />;
    case 'ctaBannerSection':
      return <CtaBannerSection key={key} block={block} lang={lang} />;
    case 'packagesSection':
      return <PackagesSection key={key} block={block} lang={lang} />;
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
