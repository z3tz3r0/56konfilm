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
import { StatsCounterSectionBlock } from './stats-counter-section/types';
import { TeamSectionBlock } from './team-section/types';
import { FAQSectionBlock } from './faq-section/types';
import { VideoShowreelSectionBlock } from './video-showreel-section/types';
import { ProcessSectionBlock } from './process-section/types';
import { AwardsSectionBlock } from './awards-section/types';
import { ContactInfoSectionBlock } from './contact-info-section/types';
import { BlogPreviewSectionBlock } from './blog-preview-section/types';
import { CapabilitiesSectionBlock } from './capabilities-section/types';
import { Locale, SiteMode } from '@shared/config';
import { FeaturedProjectsSectionBlock } from './featured-project-section/types';

const TwoColumnSection = dynamic(
  () => import('./two-column-section/TwoColumnSection')
);
const CardCollectionSection = dynamic(
  () => import('./card-collection-section/CardCollectionSection')
);
const TimelineSection = dynamic(
  () => import('./timeline-section/TimelineSection')
);
const LogoGridSection = dynamic(
  () => import('./logo-grid-section/components/LogoGridSection')
);
const CtaBannerSection = dynamic(
  () => import('./cta-banner-section/components/CtaBannerSection')
);
const MediaGallerySection = dynamic(
  () => import('./media-gallery-section/components/MediaGallerySection')
);
const PackagesSection = dynamic(
  () => import('./package-section/components/PackagesSection')
);
const TestimonialSection = dynamic(
  () => import('./testimonial-section/components/TestimonialSection')
);
const PhilosophySection = dynamic(
  () => import('./philosophy-section/components/PhilosophySection')
);
const StatsCounterSection = dynamic(
  () => import('./stats-counter-section/components/StatsCounterSection')
);
const TeamSection = dynamic(() => import('./team-section/TeamSection'));
const FAQSection = dynamic(() => import('./faq-section/components/FAQSection'));
const VideoShowreelSection = dynamic(
  () => import('./video-showreel-section/components/VideoShowreelSection')
);
const FeaturedProjectSection = dynamic(
  () => import('./featured-project-section/FeaturedProjectSection')
);
const ProcessSection = dynamic(
  () => import('@features/process-section/components/ProcessSection')
);
const AwardsSection = dynamic(
  () => import('@features/awards-section/components/AwardsSection')
);
const ContactInfoSection = dynamic(
  () => import('@features/contact-info-section/components/ContactInfoSection')
);
const BlogPreviewSection = dynamic(
  () => import('@features/blog-preview-section/components/BlogPreviewSection')
);
const CapabilitiesSection = dynamic(
  () => import('@features/capabilities-section/components/CapabilitiesSection')
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
  | PhilosophySectionBlock
  | StatsCounterSectionBlock
  | TeamSectionBlock
  | FAQSectionBlock
  | VideoShowreelSectionBlock
  | FeaturedProjectsSectionBlock
  | ProcessSectionBlock
  | AwardsSectionBlock
  | ContactInfoSectionBlock
  | BlogPreviewSectionBlock
  | CapabilitiesSectionBlock;

type FullPageDocument = PageDocument<PageContentBlock>;

interface PageBuilderProps {
  page: FullPageDocument;
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
  const blocks = page.contentBlocks ?? [];
  const contentSignature = enableSignature ? hashBlocks(blocks) : undefined;

  if (!blocks.length) {
    return (
      <section className='py-16 md:py-24'>
        <div className='border-border/60 bg-muted/20 text-muted-foreground rounded-2xl border p-12 text-center'>
          เนื้อหาอยู่ระหว่างการจัดเตรียม กรุณากลับมาอีกครั้ง
        </div>
      </section>
    );
  }

  return (
    <div
      className='contents'
      data-testid='page-content'
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
      return (
        <CardCollectionSection
          key={key}
          block={block}
          lang={lang}
          mode={mode}
        />
      );
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
    case 'statsCounterSection':
      return <StatsCounterSection key={key} block={block} />;
    case 'teamSection':
      return <TeamSection key={key} block={block} lang={lang} />;
    case 'faqSection':
      return <FAQSection key={key} block={block} />;
    case 'videoShowreelSection':
      return <VideoShowreelSection key={key} block={block} />;
    case 'featuredProjectsSection':
      return (
        <FeaturedProjectSection
          key={key}
          block={block}
          lang={lang}
          mode={mode}
        />
      );
    case 'processSection':
      return <ProcessSection key={key} block={block} />;
    case 'awardsSection':
      return <AwardsSection key={key} block={block} />;
    case 'contactInfoSection':
      return <ContactInfoSection key={key} block={block} />;
    case 'blogPreviewSection':
      return (
        <BlogPreviewSection key={key} block={block} lang={lang} mode={mode} />
      );
    case 'capabilitiesSection':
      return <CapabilitiesSection key={key} block={block} />;
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
