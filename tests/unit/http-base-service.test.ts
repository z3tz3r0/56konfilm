// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpBaseService } from '@shared/lib/http/httpBaseService';

class TestHttpService extends HttpBaseService {
  static request = this.post;
}

afterEach(() => vi.unstubAllGlobals());

describe('HttpBaseService', () => {
  it('posts JSON without caching or retries and parses the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: '123' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      TestHttpService.request(
        'https://example.com/api',
        { name: 'Visitor' },
        {
          Authorization: 'Bearer test',
        }
      )
    ).resolves.toEqual({ id: '123' });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test',
      },
      body: JSON.stringify({ name: 'Visitor' }),
      cache: 'no-store',
      signal: expect.any(AbortSignal),
    });
  });

  it('rejects non-2xx responses without retrying', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 429 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      TestHttpService.request('https://example.com', {})
    ).rejects.toThrow(/429/);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('rejects invalid JSON instead of treating HTTP 2xx as delivery', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json')));
    await expect(
      TestHttpService.request('https://example.com', {})
    ).rejects.toThrow(/valid JSON/);
  });

  it('allows an aborted request to fail without retrying', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new DOMException('Timed out', 'TimeoutError'));
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      TestHttpService.request('https://example.com', {})
    ).rejects.toThrow(/Timed out/);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
