import { CACHE_TAGS } from '@shared/config';
import type { Locale, SiteMode } from '@shared/config';
import { SanityBaseService } from '@/sanity/lib/client';
import {
  allPageSlugsQuery,
  allProjectSlugsQuery,
  pageBySlugQuery,
  projectBySlugQuery,
  settingsQuery,
} from '@/sanity/lib/queries';
import { PageDocument, PageSlugs, Project, SiteSettings } from '@shared/types';

interface BaseParams {
  lang: Locale;
  mode: SiteMode;
  slug: string;
}

export class ContentService extends SanityBaseService {
  // --- Page ---
  static async getPage({ lang, mode, slug }: BaseParams) {
    return this.fetch<PageDocument | null>({
      query: pageBySlugQuery,
      params: {
        lang,
        mode,
        slug,
      },
      tags: [
        CACHE_TAGS.ALL_PAGES,
        CACHE_TAGS.PAGES_BY_MODE(mode),
        CACHE_TAGS.SPECIFIC_PAGE(mode, slug),
      ],
    });
  }

  // --- Setting ---
  static async getSetting({ lang }: Pick<BaseParams, 'lang'>) {
    return this.fetch<SiteSettings>({
      query: settingsQuery,
      params: { lang },
      tags: [CACHE_TAGS.SETTINGS],
    });
  }

  // --- Project ---
  static async getProject({ lang, mode, slug }: BaseParams) {
    return this.fetch<Project | null>({
      query: projectBySlugQuery,
      params: { lang, mode, slug },
      tags: [
        CACHE_TAGS.ALL_PROJECTS,
        CACHE_TAGS.PROJECTS_BY_MODE(mode),
        CACHE_TAGS.SPECIFIC_PROJECT(mode, slug),
      ],
    });
  }

  // --- Slug ---
  static async getAllPageSlugs() {
    return this.fetch<PageSlugs[]>({
      query: allPageSlugsQuery,
      tags: [CACHE_TAGS.ALL_PAGE_SLUGS],
    });
  }
  static async getAllProjectSlugs() {
    return this.fetch<PageSlugs[]>({
      query: allProjectSlugsQuery,
      tags: [CACHE_TAGS.ALL_PROJECT_SLUGS],
    });
  }
}
