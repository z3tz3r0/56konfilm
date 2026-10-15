import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentService } from '@services/contentService';
import { client, writeClient } from '@/sanity/lib/client';
import { CACHE_TAGS } from '@shared/config/cacheTags';
import { pageBySlugQuery } from '@/sanity/lib/queries';

const mocks = vi.hoisted(() => {
  const readClient = { fetch: vi.fn() };
  const credentialClient = { fetch: vi.fn() };
  return {
    readClient,
    credentialClient,
    createClient: vi.fn((config: { token?: string }) =>
      config.token ? credentialClient : readClient
    ),
  };
});
vi.mock('next-sanity', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next-sanity')>()),
  createClient: mocks.createClient,
}));
vi.mock('@shared/config', async () => ({
  CACHE_TAGS: (await import('@shared/config/cacheTags')).CACHE_TAGS,
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: 'fixture-project',
    NEXT_PUBLIC_SANITY_DATASET: 'fixture-dataset',
    NEXT_PUBLIC_SANITY_API_VERSION: '2025-08-12',
    SANITY_API_TOKEN: 'fixture-only',
  },
}));

beforeEach(() => {
  mocks.readClient.fetch.mockReset().mockResolvedValue(null);
  mocks.credentialClient.fetch.mockReset();
});

describe('Public catalog reads through the existing content service', () => {
  it.each(['production', 'wedding'] as const)(
    'uses published perspective and retains all %s page cache tags',
    async (mode) => {
      await ContentService.getPage({ mode, lang: 'th', slug: 'packages' });
      expect(mocks.readClient.fetch).toHaveBeenCalledExactlyOnceWith(
        pageBySlugQuery,
        { mode, lang: 'th', slug: 'packages' },
        {
          perspective: 'published',
          cache: 'force-cache',
          next: {
            revalidate: false,
            tags: [
              CACHE_TAGS.ALL_PAGES,
              CACHE_TAGS.PAGES_BY_MODE(mode),
              CACHE_TAGS.SPECIFIC_PAGE(mode, 'packages'),
            ],
          },
        }
      );
    }
  );

  it('scopes published perspective to content fetches without changing exported credential clients', () => {
    expect(client).toBe(mocks.readClient);
    expect(writeClient).toBe(mocks.credentialClient);
    expect(mocks.createClient.mock.calls).toHaveLength(2);
    for (const [config] of mocks.createClient.mock.calls)
      expect(config).not.toHaveProperty('perspective');
    expect(mocks.createClient.mock.calls[1][0]).toMatchObject({
      token: 'fixture-only',
      useCdn: false,
    });
    expect(mocks.credentialClient.fetch).not.toHaveBeenCalled();
  });
});
