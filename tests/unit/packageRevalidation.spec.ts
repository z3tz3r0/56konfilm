// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { CACHE_TAGS } from '@shared/config/cacheTags';
import { POST } from '@/app/api/revalidate/route';

const { parseBody, revalidateTag } = vi.hoisted(() => ({
  parseBody: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock('next-sanity/webhook', () => ({ parseBody }));
vi.mock('next/cache', () => ({ revalidateTag }));
vi.mock('@shared/config', async () => ({
  CACHE_TAGS: (await import('@shared/config/cacheTags')).CACHE_TAGS,
  env: { NODE_ENV: 'production', SANITY_REVALIDATE_SECRET: 'fixture-only' },
}));

const request = () =>
  new NextRequest('https://example.com/api/revalidate', { method: 'POST' });

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('Package catalog cache invalidation', () => {
  it.each(['package', 'packageService'])(
    'refreshes all page caches for %s without a page slug',
    async (_type) => {
      parseBody.mockResolvedValue({ body: { _type }, isValidSignature: true });
      const response = await POST(request());
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({ revalidated: true });
      expect(revalidateTag).toHaveBeenCalledExactlyOnceWith(
        CACHE_TAGS.ALL_PAGES,
        { expire: 0 }
      );
    }
  );

  it.each(['production', 'wedding'] as const)(
    'keeps %s page invalidation scoped to its existing tag',
    async (mode) => {
      parseBody.mockResolvedValue({
        body: { _type: 'page', page: { mode, slug: 'packages' } },
        isValidSignature: true,
      });
      expect((await POST(request())).status).toBe(200);
      expect(revalidateTag).toHaveBeenCalledExactlyOnceWith(
        CACHE_TAGS.SPECIFIC_PAGE(mode, 'packages'),
        { expire: 0 }
      );
    }
  );

  it('retains project and settings invalidation', async () => {
    parseBody.mockResolvedValue({
      body: { _type: 'project', page: { mode: 'production', slug: 'project' } },
      isValidSignature: true,
    });
    await POST(request());
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith(
      CACHE_TAGS.ALL_PROJECTS,
      { expire: 0 }
    );
    revalidateTag.mockClear();
    parseBody.mockResolvedValue({
      body: { _type: 'settings' },
      isValidSignature: true,
    });
    expect((await POST(request())).status).toBe(200);
    expect(revalidateTag.mock.calls).toEqual([
      [CACHE_TAGS.ALL_PAGES, { expire: 0 }],
      [CACHE_TAGS.SETTINGS, { expire: 0 }],
    ]);
  });

  it('rejects invalid signatures and payloads before invalidating caches', async () => {
    parseBody.mockResolvedValue({
      body: { _type: 'package' },
      isValidSignature: false,
    });
    expect((await POST(request())).status).toBe(401);
    parseBody.mockResolvedValue({ body: {}, isValidSignature: true });
    expect((await POST(request())).status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
