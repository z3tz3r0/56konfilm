// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCredentialClient } from '@/sanity/lib/serverClient';

const { createClient, env } = vi.hoisted(() => ({
  createClient: vi.fn(),
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: 'fixture-project',
    NEXT_PUBLIC_SANITY_DATASET: 'development',
    NEXT_PUBLIC_SANITY_API_VERSION: '2025-08-12',
    SANITY_API_TOKEN: '' as string | undefined,
  },
}));
vi.mock('server-only', () => ({}));
vi.mock('next-sanity', () => ({ createClient }));
vi.mock('@shared/config/env', () => ({ env }));
beforeEach(() => {
  createClient.mockReset();
  env.SANITY_API_TOKEN = 'fixture-secret-token';
});

describe('Dedicated server credential client', () => {
  it('uses the server token and raw, non-CDN reads', () => {
    const sentinel = {};
    createClient.mockReturnValue(sentinel);
    expect(getCredentialClient()).toBe(sentinel);
    expect(createClient).toHaveBeenCalledExactlyOnceWith({
      projectId: 'fixture-project',
      dataset: 'development',
      apiVersion: '2025-08-12',
      token: 'fixture-secret-token',
      useCdn: false,
      perspective: 'raw',
    });
  });
  it.each([undefined, '', '   '])(
    'refuses missing token %j before creating a client',
    (token) => {
      env.SANITY_API_TOKEN = token;
      expect(() => getCredentialClient()).toThrow(
        'CMS credential store is not configured.'
      );
      expect(createClient).not.toHaveBeenCalled();
    }
  );
});
