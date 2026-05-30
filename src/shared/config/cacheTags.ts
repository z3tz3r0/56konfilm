import { SiteMode } from './preferences';

const CACHE_TAGS = {
  SETTINGS: 'settings',

  // Page
  ALL_PAGES: 'pages',
  PAGES_BY_MODE: (mode: SiteMode) => `pages:${mode}`,
  SPECIFIC_PAGE: (mode: SiteMode, slug: string) => `pages:${mode}:${slug}`,

  // Project
  ALL_PROJECTS: 'projects',
  PROJECTS_BY_MODE: (mode: SiteMode) => `projects:${mode}`,
  SPECIFIC_PROJECT: (mode: SiteMode, slug: string) =>
    `projects:${mode}:${slug}`,

  // Project Tags
  ALL_PROJECT_TAGS: 'project-tags',

  // Post
  ALL_POSTS: 'post',
  POSTS_BY_MODE: (mode: SiteMode) => `posts:${mode}`,
  SPECIFIC_POST: (mode: SiteMode, slug: string) => `posts:${mode}:${slug}`,

  // Page Slugs
  ALL_PAGE_SLUGS: 'page-slugs',
  ALL_PROJECT_SLUGS: 'project-slugs',
};

export { CACHE_TAGS };
