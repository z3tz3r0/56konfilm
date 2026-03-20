import { ImageSource } from './sanity';
import { SiteMode } from '@shared/config';

interface PageDocument<TBlocks = unknown> {
  title?: string;
  slug: string;
  seoTitle?: string;
  seo?: SeoFields;
  siteMode: SiteMode;
  contentBlocks?: TBlocks[];
}

interface SeoFields {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: ImageSource;
}

export type { PageDocument, SeoFields };
