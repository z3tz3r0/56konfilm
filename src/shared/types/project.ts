import { PageContentBlock } from './pageBlock';
import { SeoFields } from './page';
import { ImageSource } from './sanity';
import { SiteMode } from '@shared/config';

interface Project {
  _id: string;
  title: string;
  overview: string;
  siteMode: SiteMode;
  slug: string;
  coverImage?: ImageSource;
  // Magazine Layout Fields
  client?: string;
  services?: string[];
  year?: string;
  contentBlocks?: PageContentBlock[];
  publishedAt?: string;
  seo?: SeoFields;
  nextProject?: NextProject;
}

interface NextProject {
  title: string;
  slug: string;
  coverImage: ImageSource;
}

export type { Project };
