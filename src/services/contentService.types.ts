import { Locale, SiteMode } from '@shared/config';

interface BaseParams {
  lang: Locale;
  mode: SiteMode;
  slug: string;
}

type AllProjectsParams = Omit<BaseParams, 'slug'> & {
  tag?: string;
  page?: number;
  limit?: number;
};

export type { BaseParams, AllProjectsParams };
