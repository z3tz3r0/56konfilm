import { PortableTextBlock } from 'next-sanity';
import { SeoFields } from './page';
import { ImageSource } from './sanity';
import { SiteMode } from '@shared/config';

interface Project {
  _id: string;
  title: string;
  slug: string;
  coverImage?: ImageSource;
  siteMode: UniqueSiteModesArray;
  overview?: string;
  body?: PortableTextBlock[];
  client?: string;
  projectDate: string;
  services?: string[];
  tags?: string[];
  seo?: SeoFields;
  nextProject?: NextProject;
}

interface NextProject {
  title: string;
  slug: string;
  coverImage?: ImageSource;
}

interface ProjectTag {
  _id: string;
  title: string;
  slug: string;
}

type NonEmptyUniqueTuple<
  T extends string,
  U extends string = T,
  A extends unknown[] = [],
> = [T] extends [never]
  ? A
  : T extends unknown
    ? NonEmptyUniqueTuple<Exclude<U, T>, Exclude<U, T>, [...A, T]> | [...A, T]
    : never;
type UniqueSiteModesArray = NonEmptyUniqueTuple<SiteMode>;

export type { Project, ProjectTag };
