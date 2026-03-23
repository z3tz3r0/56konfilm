import { SeoFields } from './page';
import { ImageSource } from './sanity';
import { SiteMode } from '@shared/config';

interface Project<TBlocks = unknown> {
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
  contentBlocks?: TBlocks[];
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
