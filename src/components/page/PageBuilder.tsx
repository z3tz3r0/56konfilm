import CardCollectionSection from '@/components/page/sections/CardCollectionSection';
import CtaBannerSection from '@/components/page/sections/CtaBannerSection';
import HeroSection from '@/components/page/sections/HeroSection';
import LogoGridSection from '@/components/page/sections/LogoGridSection';
import MediaGallerySection from '@/components/page/sections/MediaGallerySection';
import TimelineSection from '@/components/page/sections/TimelineSection';
import TwoColumnSection from '@/components/page/sections/TwoColumnSection';
import { PageContentBlock, PageDocument } from '@/types/sanity';

interface PageBuilderProps {
  page: PageDocument;
}

export default function PageBuilder({ page }: PageBuilderProps) {
  const blocks = page.contentBlocks ?? [];

  if (!blocks.length) {
    return (
      <section className="container py-16 md:py-24">
        <div className="border-border/60 bg-muted/20 text-muted-foreground rounded-2xl border p-12 text-center">
          เนื้อหาอยู่ระหว่างการจัดเตรียม กรุณากลับมาอีกครั้ง
        </div>
      </section>
    );
  }

  return <>{blocks.map((block, index) => renderBlock(block, index))}</>;
}

function renderBlock(block: PageContentBlock, index: number) {
  const key = block._key ?? `${block._type}-${index}`;

  switch (block._type) {
    case 'heroSection':
      return <HeroSection key={key} block={block} />;
    case 'twoColumnSection':
      return <TwoColumnSection key={key} block={block} />;
    case 'cardCollectionSection':
      return <CardCollectionSection key={key} block={block} />;
    case 'timelineSection':
      return <TimelineSection key={key} block={block} />;
    case 'mediaGallerySection':
      return <MediaGallerySection key={key} block={block} />;
    case 'logoGridSection':
      return <LogoGridSection key={key} block={block} />;
    case 'ctaBannerSection':
      return <CtaBannerSection key={key} block={block} />;
    default:
      return null;
  }
}
