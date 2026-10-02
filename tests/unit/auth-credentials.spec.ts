// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCredentialsFromSanity,
  updatePasswordInSanity,
} from '@shared/lib/auth/sanityCredentials';

const { fetchCredentials, patch, set, commit } = vi.hoisted(() => ({
  fetchCredentials: vi.fn(),
  patch: vi.fn(),
  set: vi.fn(),
  commit: vi.fn(),
}));
vi.mock('@/sanity/lib/client', () => ({
  client: { fetch: fetchCredentials },
  writeClient: { patch },
}));
vi.mock('@shared/config', () => ({
  env: {
    SANITY_CMS_SESSION_SECRET: 'test-session-secret',
    SANITY_CMS_SESSION_MAX_AGE: 604_800,
    SANITY_CMS_REMEMBER_MAX_AGE: 2_592_000,
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
  patch.mockReturnValue({ set });
  set.mockReturnValue({ commit });
  commit.mockResolvedValue(undefined);
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2050-01-02T03:04:05.000Z'));
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Sanity credential helpers with mocked clients', () => {
  it('preserves the query and returns stored credentials', async () => {
    const credentials = { username: 'editor', password: 'stored-hash' };
    fetchCredentials.mockResolvedValue(credentials);
    await expect(getCredentialsFromSanity()).resolves.toEqual(credentials);
    expect(fetchCredentials).toHaveBeenCalledExactlyOnceWith(
      '*[_type == "cmsCredentials" && _id == "cms-credentials"][0] {\n        username,\n        password\n      }'
    );
  });

  it('preserves a missing credential result', async () => {
    fetchCredentials.mockResolvedValue(null);
    await expect(getCredentialsFromSanity()).resolves.toBeNull();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('logs the original message and returns null when reading fails', async () => {
    const error = new Error('Read failed');
    fetchCredentials.mockRejectedValue(error);
    await expect(getCredentialsFromSanity()).resolves.toBeNull();
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      'Error fetching credentials from Sanity:',
      error
    );
  });

  it('preserves the document, hash, timestamp, and patch chain', async () => {
    await expect(updatePasswordInSanity('new-hash')).resolves.toBeUndefined();
    expect(patch).toHaveBeenCalledExactlyOnceWith('cms-credentials');
    expect(set).toHaveBeenCalledExactlyOnceWith({
      password: 'new-hash',
      updatedAt: '2050-01-02T03:04:05.000Z',
    });
    expect(commit).toHaveBeenCalledOnce();
  });

  it('logs the original message and preserves update errors', async () => {
    const error = new Error('Write failed');
    commit.mockRejectedValue(error);
    await expect(updatePasswordInSanity('new-hash')).rejects.toThrow(
      'Failed to update password'
    );
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      'Error updating password in Sanity:',
      error
    );
  });

  it('keeps only integration helpers in the Auth barrel without starting a limiter', async () => {
    const timer = vi.spyOn(globalThis, 'setInterval');
    const auth = await import('@shared/lib/auth');
    expect(Object.keys(auth).sort()).toEqual([
      'createSession',
      'getCredentialsFromSanity',
      'hashPassword',
      'updatePasswordInSanity',
      'verifyPassword',
      'verifySession',
    ]);
    expect(timer).not.toHaveBeenCalled();
  });
});
