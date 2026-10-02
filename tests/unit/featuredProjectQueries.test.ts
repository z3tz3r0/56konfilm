import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import { ContentService } from '@services/contentService';
import type { Locale, SiteMode } from '@shared/config/preferences';
import { CACHE_TAGS } from '@shared/config/cacheTags';
import { latestProjectsQuery, pageBySlugQuery } from '@/sanity/lib/queries';

const fetch = vi.hoisted(() => vi.fn());
const requireFromSanity = createRequire(
  createRequire(import.meta.url).resolve('sanity')
);
const { parse, evaluate } = requireFromSanity('groq-js') as {
  parse: (
    query: string,
    options: { params: Record<string, unknown> }
  ) => unknown;
  evaluate: (
    query: unknown,
    options: { dataset: unknown[]; params: Record<string, unknown> }
  ) => Promise<{ get: () => Promise<unknown> }>;
};

vi.mock('@/sanity/lib/client', () => ({
  SanityBaseService: class {
    static fetch = fetch;
  },
}));

const projects = Array.from({ length: 8 }, (_, index) => ({
  _id: `project-${index}`,
  _type: 'project',
  slug: { current: `project-${index}` },
  title: [
    { _key: 'en', value: `Project ${index}` },
    { _key: 'th', value: `ผลงาน ${index}` },
  ],
  siteMode: ['production', 'wedding'],
}));

/**
 * Evaluates the page query against an in-memory featured-projects fixture
 * for the requested mode and locale, returning the projected page.
 */
async function resolveSelection(
  section: Record<string, unknown>,
  mode: SiteMode,
  lang: Locale = 'en'
) {
  const page = {
    _id: 'page',
    _type: 'page',
    slug: { current: 'home' },
    siteMode: mode,
    [mode === 'production' ? 'commercialSections' : 'weddingSections']: [
      {
        _key: 'featured',
        _type: 'featuredProjectsSection',
        sourceType: 'curated',
        ...section,
      },
    ],
  };
  const params = { lang, mode, slug: 'home' };
  return (await (
    await evaluate(parse(pageBySlugQuery, { params }), {
      dataset: [page, ...projects],
      params,
    })
  ).get()) as {
    contentBlocks: Array<{
      selectedProjects: Array<{ _id: string; title: string; slug: string }>;
    }>;
  };
}

describe('Featured Projects query integration', () => {
  beforeEach(() => {
    fetch.mockReset();
    fetch.mockResolvedValue([]);
  });

  it.each(['production', 'wedding'] as const)(
    'uses the original %s service parameters and cache tags without a mode-specific limit',
    async (mode) => {
      await ContentService.getPage({ lang: 'en', mode, slug: 'home' });
      expect(fetch).toHaveBeenLastCalledWith({
        query: pageBySlugQuery,
        params: { lang: 'en', mode, slug: 'home' },
        tags: [
          CACHE_TAGS.ALL_PAGES,
          CACHE_TAGS.PAGES_BY_MODE(mode),
          CACHE_TAGS.SPECIFIC_PAGE(mode, 'home'),
        ],
      });
      await ContentService.getLatestProjects({ lang: 'en', mode });
      expect(fetch).toHaveBeenLastCalledWith({
        query: latestProjectsQuery,
        params: { lang: 'en', mode },
        tags: [CACHE_TAGS.ALL_PROJECTS, CACHE_TAGS.PROJECTS_BY_MODE(mode)],
      });
    }
  );

  for (const mode of ['production', 'wedding'] as const) {
    it.each(['en', 'th'] as const)(
      `projects up to six curated ${mode} projects in CMS order with %s content and stable IDs`,
      async (lang) => {
        const selectedIds = [6, 2, 0, 5, 1, 4, 3, 7];
        const result = await resolveSelection(
          {
            selectedProjects: [
              { _ref: 'missing-project' },
              ...selectedIds.map((index) => ({ _ref: `project-${index}` })),
            ],
            // Stored obsolete data must neither override nor supplement the shared selection.
            weddingSelectedProjects: [{ _ref: 'project-7' }],
          },
          mode,
          lang
        );
        expect(result.contentBlocks[0].selectedProjects).toEqual(
          selectedIds.slice(0, 6).map((index) =>
            expect.objectContaining({
              _id: `project-${index}`,
              slug: `project-${index}`,
              title: `${lang === 'th' ? 'ผลงาน' : 'Project'} ${index}`,
            })
          )
        );
      }
    );

    it.each([undefined, []])(
      `returns an empty ${mode} selection when the shared field is %s, without reviving obsolete data`,
      async (selectedProjects) => {
        const result = await resolveSelection(
          {
            selectedProjects,
            weddingSelectedProjects: [{ _ref: 'project-7' }],
          },
          mode
        );
        expect(result.contentBlocks[0].selectedProjects).toEqual([]);
      }
    );

    it(`returns six latest ${mode} projects in date order while excluding the other mode`, async () => {
      const params = { lang: 'en', mode };
      const dataset = projects
        .map((project, index) => ({
          ...project,
          // The newest record exercises the existing _createdAt fallback.
          ...(index === 0
            ? { _createdAt: '2026-09-30T00:00:00Z' }
            : {
                projectDate: `2026-09-${String(30 - index).padStart(2, '0')}`,
              }),
        }))
        .reverse();
      const result = (await (
        await evaluate(parse(latestProjectsQuery, { params }), {
          dataset: [
            ...dataset,
            {
              _id: 'other-mode',
              _type: 'project',
              siteMode: [mode === 'wedding' ? 'production' : 'wedding'],
              projectDate: '2026-10-01',
            },
          ],
          params,
        })
      ).get()) as Array<{ _id: string }>;
      expect(result.map((project) => project._id)).toEqual(
        Array.from({ length: 6 }, (_, index) => `project-${index}`)
      );
    });
  }
});
