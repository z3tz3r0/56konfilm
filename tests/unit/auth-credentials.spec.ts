// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCredentialsFromSanity,
  updatePasswordInSanity,
} from '@shared/lib/auth/sanityCredentials';
import {
  CMS_CREDENTIALS_ID,
  CMS_CREDENTIALS_TYPE,
} from '@shared/lib/auth/credentialDocument';

const { fetchCredentials, patch, set, commit, getClient } = vi.hoisted(() => ({
  fetchCredentials: vi.fn(),
  patch: vi.fn(),
  set: vi.fn(),
  commit: vi.fn(),
  getClient: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('@/sanity/lib/serverClient', () => ({
  getCredentialClient: getClient,
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
  getClient.mockReturnValue({ fetch: fetchCredentials, patch });
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
  it('reads only the protected ID without caching or draft overlays', async () => {
    const credentials = {
      username: 'editor',
      password: '$2b$12$' + 'a'.repeat(53),
    };
    fetchCredentials.mockResolvedValue(credentials);
    await expect(getCredentialsFromSanity()).resolves.toEqual(credentials);
    expect(fetchCredentials).toHaveBeenCalledExactlyOnceWith(
      '*[_type == $type && _id == $id][0] {\n        username,\n        password\n      }',
      { type: CMS_CREDENTIALS_TYPE, id: CMS_CREDENTIALS_ID },
      { cache: 'no-store', perspective: 'raw' }
    );
  });

  it('preserves a missing credential result', async () => {
    fetchCredentials.mockResolvedValue(null);
    await expect(getCredentialsFromSanity()).resolves.toBeNull();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('does not log SDK payloads or fall back after read failure', async () => {
    const error = new Error('sensitive-hash and bearer-token');
    fetchCredentials.mockRejectedValue(error);
    await expect(getCredentialsFromSanity()).resolves.toBeNull();
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      'CMS credential read failed.'
    );
    expect(fetchCredentials).toHaveBeenCalledOnce();
  });

  it('preserves the document, hash, timestamp, and patch chain', async () => {
    await expect(updatePasswordInSanity('new-hash')).resolves.toBeUndefined();
    expect(patch).toHaveBeenCalledExactlyOnceWith(CMS_CREDENTIALS_ID);
    expect(set).toHaveBeenCalledExactlyOnceWith({
      password: 'new-hash',
      updatedAt: '2050-01-02T03:04:05.000Z',
    });
    expect(commit).toHaveBeenCalledOnce();
  });

  it('sanitizes SDK write errors and preserves the generic update error', async () => {
    const error = new Error('Write failed');
    commit.mockRejectedValue(error);
    await expect(updatePasswordInSanity('new-hash')).rejects.toThrow(
      'Failed to update password'
    );
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      'CMS credential update failed.'
    );
  });

  it('fails closed when the server token/client is unavailable', async () => {
    getClient.mockImplementation(() => {
      throw new Error('Store not configured');
    });
    await expect(getCredentialsFromSanity()).resolves.toBeNull();
    await expect(updatePasswordInSanity('new-hash')).rejects.toThrow(
      'Failed to update password'
    );
    expect(fetchCredentials).not.toHaveBeenCalled();
    expect(patch).not.toHaveBeenCalled();
  });

  it.each([
    { username: '', password: 'hash' },
    { username: 'editor', password: 'not-bcrypt' },
  ])(
    'rejects invalid stored credentials rather than trying another record',
    async (record) => {
      fetchCredentials.mockResolvedValue(record);
      await expect(getCredentialsFromSanity()).resolves.toBeNull();
      expect(fetchCredentials).toHaveBeenCalledOnce();
    }
  );

  it('reads the new password immediately after an update', async () => {
    const stored = { username: 'editor', password: '$2b$12$' + 'a'.repeat(53) };
    fetchCredentials.mockImplementation(async () => ({ ...stored }));
    const next = '$2b$12$' + 'b'.repeat(53);
    commit.mockImplementation(async () => {
      stored.password = next;
    });
    expect((await getCredentialsFromSanity())?.password).not.toBe(next);
    await updatePasswordInSanity(next);
    expect((await getCredentialsFromSanity())?.password).toBe(next);
    expect(fetchCredentials).toHaveBeenCalledTimes(2);
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
