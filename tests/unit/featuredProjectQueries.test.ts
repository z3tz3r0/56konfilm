import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import { ContentService } from '@services/contentService';
import { FEATURED_PROJECT_LIMITS } from '@shared/config/preferences';
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

describe('Featured Projects query integration', () => {
  beforeEach(() => {
    fetch.mockReset();
    fetch.mockResolvedValue([]);
  });

  it.each(['production', 'wedding'] as const)(
    'passes the %s limit to page and latest-project queries',
    async (mode) => {
      await ContentService.getPage({ lang: 'en', mode, slug: 'home' });
      expect(fetch).toHaveBeenLastCalledWith(
        expect.objectContaining({
          query: pageBySlugQuery,
          params: {
            lang: 'en',
            mode,
            slug: 'home',
            featuredProjectLimit: FEATURED_PROJECT_LIMITS[mode],
          },
        })
      );

      await ContentService.getLatestProjects({ lang: 'en', mode });
      expect(fetch).toHaveBeenLastCalledWith(
        expect.objectContaining({
          query: latestProjectsQuery,
          params: {
            lang: 'en',
            mode,
            featuredProjectLimit: FEATURED_PROJECT_LIMITS[mode],
          },
        })
      );
    }
  );

  it('resolves Wedding selections, legacy fallback, and an intentionally empty new field', async () => {
    const projects = Array.from({ length: 8 }, (_, index) => ({
      _id: `project-${index}`,
      _type: 'project',
      slug: { current: `project-${index}` },
      title: [{ _key: 'en', value: `Project ${index}` }],
      siteMode: ['production', 'wedding'],
    }));
    const section: {
      _key: string;
      _type: string;
      sourceType: string;
      selectedProjects: Array<{ _ref: string }>;
      weddingSelectedProjects?: Array<{ _ref: string }>;
    } = {
      _key: 'featured',
      _type: 'featuredProjectsSection',
      sourceType: 'curated',
      selectedProjects: [0, 1, 2, 3].map((index) => ({
        _ref: `project-${index}`,
      })),
      weddingSelectedProjects: [
        'project-4',
        'missing-project',
        'project-2',
        'project-6',
      ].map((_ref) => ({ _ref })),
    };
    const page = {
      _id: 'page',
      _type: 'page',
      slug: { current: 'home' },
      siteMode: 'wedding',
      weddingSections: [section],
    };

    async function resolveIds(mode: 'production' | 'wedding') {
      page.siteMode = mode;
      const params = {
        lang: 'en',
        mode,
        slug: 'home',
        featuredProjectLimit: FEATURED_PROJECT_LIMITS[mode],
      };
      const query = parse(pageBySlugQuery, { params });
      const result = (await (
        await evaluate(query, { dataset: [page, ...projects], params })
      ).get()) as {
        contentBlocks: Array<{ selectedProjects: Array<{ _id: string }> }>;
      };
      return result.contentBlocks[0].selectedProjects.map(
        (project) => project._id
      );
    }

    expect(await resolveIds('wedding')).toEqual([
      'project-4',
      'project-2',
      'project-6',
    ]);
    expect(await resolveIds('production')).toEqual([
      'project-0',
      'project-1',
      'project-2',
      'project-3',
    ]);
    delete section.weddingSelectedProjects;
    expect(await resolveIds('wedding')).toEqual([
      'project-0',
      'project-1',
      'project-2',
    ]);
    section.weddingSelectedProjects = [];
    expect(await resolveIds('wedding')).toEqual([]);
  });

  it.each(['production', 'wedding'] as const)(
    'limits latest %s projects while keeping newest-first order',
    async (mode) => {
      const projects = Array.from({ length: 8 }, (_, index) => ({
        _id: `project-${index}`,
        _type: 'project',
        slug: { current: `project-${index}` },
        siteMode: ['production', 'wedding'],
        projectDate: `2026-09-${String(30 - index).padStart(2, '0')}`,
      }));
      const params = {
        lang: 'en',
        mode,
        featuredProjectLimit: FEATURED_PROJECT_LIMITS[mode],
      };
      const result = (await (
        await evaluate(parse(latestProjectsQuery, { params }), {
          dataset: projects,
          params,
        })
      ).get()) as Array<{ _id: string }>;
      expect(result.map((project) => project._id)).toEqual(
        Array.from(
          { length: FEATURED_PROJECT_LIMITS[mode] },
          (_, index) => `project-${index}`
        )
      );
    }
  );
});
