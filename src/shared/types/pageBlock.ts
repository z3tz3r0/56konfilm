import { ImageSource } from './sanity';
import { CardCollectionSectionBlock } from '@features/card-collection-section/types';
import { CtaBannerSectionBlock } from '@features/cta-banner-section/types/ctaBannerBlock.types';
import { HeroSectionBlock } from '@features/hero-section/types';
import { LogoGridSectionBlock } from '@features/logo-grid-section/types';
import { MediaGallerySectionBlock } from '@features/media-gallery-section/types';
import { PackagesSectionBlock } from '@features/package-section/types';
import { PhilosophySectionBlock } from '@features/philosophy-section/types';
import { TestimonialSectionBlock } from '@features/testimonial-section/types';
import { TimelineSectionBlock } from '@features/timeline-section/types';
import { TwoColumnSectionBlock } from '@features/two-column-section/types';

interface BaseBlock {
  _key?: string;
}

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

// Content Cta
type LinkType = 'internal' | 'external' | null;
type CtaStyle = 'primary' | 'secondary' | 'link' | null;
interface ContentCta {
  label?: string;
  style: CtaStyle;
  linkType: LinkType;
  pageRef?: { slug?: string };
  externalUrl?: string;
}

interface MediaItem {
  _key?: string;
  image?: ImageSource;
  alt?: string;
}

interface BackgroundMediaItem {
  _key?: string;
  _type: string;
  url?: string;
  mimeType?: string;
  image?: ImageSource;
}

export type {
  BaseBlock,
  PageContentBlock,
  ContentCta,
  MediaItem,
  BackgroundMediaItem,
};
