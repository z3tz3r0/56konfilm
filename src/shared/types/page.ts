import { ImageSource } from './sanity';
import { PageContentBlock } from './pageBlock';
import { SiteMode } from '@shared/config';

interface PageDocument {
  title?: string;
  slug: string;
  seoTitle?: string;
  seo?: SeoFields;
  siteMode: SiteMode;
  contentBlocks?: PageContentBlock[];
}

interface SeoFields {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: ImageSource;
}

export type { PageDocument, SeoFields };
