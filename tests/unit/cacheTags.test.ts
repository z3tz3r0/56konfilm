import { describe, expect, it } from 'vitest';
import { CACHE_TAGS } from '@shared/config/cacheTags';

describe('CACHE_TAGS', () => {
  it('has static tag for settings', () => {
    expect(CACHE_TAGS.SETTINGS).toBe('settings');
  });

  it('generates mode-scoped page tags', () => {
    expect(CACHE_TAGS.PAGES_BY_MODE('production')).toBe('pages:production');
    expect(CACHE_TAGS.PAGES_BY_MODE('wedding')).toBe('pages:wedding');
  });

  it('generates page-specific tags with mode and slug', () => {
    expect(CACHE_TAGS.SPECIFIC_PAGE('production', 'home')).toBe(
      'pages:production:home'
    );
  });

  it('generates project tags', () => {
    expect(CACHE_TAGS.ALL_PROJECTS).toBe('projects');
    expect(CACHE_TAGS.PROJECTS_BY_MODE('wedding')).toBe('projects:wedding');
    expect(CACHE_TAGS.SPECIFIC_PROJECT('production', 'demo')).toBe(
      'projects:production:demo'
    );
  });

  it('generates post tags', () => {
    expect(CACHE_TAGS.ALL_POSTS).toBe('post');
    expect(CACHE_TAGS.POSTS_BY_MODE('production')).toBe('posts:production');
    expect(CACHE_TAGS.SPECIFIC_POST('wedding', 'first-post')).toBe(
      'posts:wedding:first-post'
    );
  });

  it('has slug tags', () => {
    expect(CACHE_TAGS.ALL_PAGE_SLUGS).toBe('page-slugs');
    expect(CACHE_TAGS.ALL_PROJECT_SLUGS).toBe('project-slugs');
  });
});
