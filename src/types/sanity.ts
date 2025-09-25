import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface I18nArrayItem<T> {
  _key: string;
  value: T;
}

// --- Raw Data from Sanity ---
export interface RawProject {
  _id: string;
  title: I18nArrayItem<string>[];
  overview: I18nArrayItem<string>[];
  siteMode: 'production' | 'wedding';
  slug: { current: string };
  coverImage: SanityImageSource;
}

// --- Data after resolving language in GROQ ---
export interface Project {
  _id: string;
  title: string;
  overview: string;
  siteMode: ('production' | 'wedding')[];
  slug: string;
  coverImage: SanityImageSource;
}

export type SiteMode = 'production' | 'wedding';

export interface PageRouteParams {
  slug: string;
}

export interface PageLinkReference {
  slug?: string;
  url?: string;
}

export type LinkType = 'internal' | 'external' | null;

export type CtaStyle = 'primary' | 'secondary' | 'link' | null;

export interface ContentCta {
  label?: string;
  style: CtaStyle;
  linkType: LinkType;
  pageRef?: { slug?: string };
  externalUrl?: string;
}

export interface MediaItem {
  image?: SanityImageSource;
  alt?: string;
}

export interface BackgroundMediaItem {
  _type: string;
  url?: string;
  mimeType?: string;
  image?: SanityImageSource;
}

interface BaseBlock {
  _key?: string;
}

export interface HeroSectionBlock extends BaseBlock {
  _type: 'heroSection';
  title?: string;
  tagline?: string;
  backgroundMedia?: BackgroundMediaItem[];
  ctas?: ContentCta[];
}

export interface TwoColumnSectionBlock extends BaseBlock {
  _type: 'twoColumnSection';
  layout?: string;
  background?: string;
  content: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    align?: string;
  };
  media?: MediaItem;
  ctas?: ContentCta[];
}

export interface CardCollectionSectionBlock extends BaseBlock {
  _type: 'cardCollectionSection';
  title?: string;
  intro?: string;
  columns?: number;
  background?: string;
  cards?: Array<{
    title?: string;
    body?: string;
    icon?: SanityImageSource;
    variant?: string;
    cta?: ContentCta;
  }>;
}

export interface TimelineSectionBlock extends BaseBlock {
  _type: 'timelineSection';
  background?: string;
  heading: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    align?: string;
  };
  steps?: Array<{
    order?: number;
    title?: string;
    description?: string;
  }>;
  cta?: ContentCta;
}

export interface MediaGallerySectionBlock extends BaseBlock {
  _type: 'mediaGallerySection';
  background?: string;
  heading: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    align?: string;
  };
  items?: Array<{
    media?: MediaItem;
    label?: string;
  }>;
  cta?: ContentCta;
}

export interface LogoGridSectionBlock extends BaseBlock {
  _type: 'logoGridSection';
  background?: string;
  title?: string;
  logos?: MediaItem[];
}

export interface CtaBannerSectionBlock extends BaseBlock {
  _type: 'ctaBannerSection';
  background?: string;
  layout?: string;
  content: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    align?: string;
  };
  media?: MediaItem;
  ctas?: ContentCta[];
}

export type PageContentBlock =
  | HeroSectionBlock
  | TwoColumnSectionBlock
  | CardCollectionSectionBlock
  | TimelineSectionBlock
  | MediaGallerySectionBlock
  | LogoGridSectionBlock
  | CtaBannerSectionBlock;

export interface PageDocument {
  title?: string;
  slug: string;
  seoTitle?: string;
  siteMode: SiteMode;
  contentBlocks?: PageContentBlock[];
}
