import { CACHE_TAGS } from '@shared/config';
import { SanityBaseService } from '@/sanity/lib/client';
import {
  allPageSlugsQuery,
  allProjectSlugsQuery,
  allProjectsQuery,
  allProjectTagsQuery,
  latestProjectsQuery,
  pageBySlugQuery,
  projectBySlugQuery,
  projectsCountQuery,
  settingsQuery,
} from '@/sanity/lib/queries';
import { PageSlugs, Project, ProjectTag, SiteSettings } from '@shared/types';
import { FullPageDocument } from '@features/PageBuilder';
import { AllProjectsParams, BaseParams } from './contentService.types';

export class ContentService extends SanityBaseService {
  // --- Page ---
  static async getPage({ lang, mode, slug }: BaseParams) {
    return this.fetch<FullPageDocument | null>({
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
  static async getAllProjects({
    lang,
    mode,
    tag = '',
    page = 1,
    limit = 12,
  }: AllProjectsParams) {
    const start = (page - 1) * limit;
    const end = start + limit;
    const [projects, totalCount] = await Promise.all([
      this.fetch<Project[]>({
        query: allProjectsQuery,
        params: { lang, mode, tag, start, end },
        tags: [CACHE_TAGS.ALL_PROJECTS, CACHE_TAGS.PROJECTS_BY_MODE(mode)],
      }),
      this.fetch<number>({
        query: projectsCountQuery,
        params: { mode, tag },
        tags: [CACHE_TAGS.ALL_PROJECTS, CACHE_TAGS.PROJECTS_BY_MODE(mode)],
      }),
    ]);
    return {
      projects: projects || [],
      totalCount: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / limit),
    };
  }
  static async getLatestProjects({ lang, mode }: Omit<BaseParams, 'slug'>) {
    return this.fetch<Project[]>({
      query: latestProjectsQuery,
      params: { lang, mode },
      tags: [CACHE_TAGS.ALL_PROJECTS, CACHE_TAGS.PROJECTS_BY_MODE(mode)],
    });
  }

  // --- Project Tags ---
  static async getAllProjectTags({ lang }: Pick<BaseParams, 'lang'>) {
    return this.fetch<ProjectTag[]>({
      query: allProjectTagsQuery,
      params: { lang },
      tags: [CACHE_TAGS.ALL_PROJECT_TAGS],
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
