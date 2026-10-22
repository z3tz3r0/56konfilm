// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as changePassword } from '@/app/api/auth/change-password/route';
import { GET as verify } from '@/app/api/auth/verify/route';
import { CMS_CREDENTIALS_ID } from '@shared/lib/auth/credentialDocument';

const mocks = vi.hoisted(() => {
  const oldHash = '$2b$12$' + 'a'.repeat(53),
    nextHash = '$2b$12$' + 'b'.repeat(53);
  return {
    oldHash,
    nextHash,
    state: { password: oldHash },
    fetch: vi.fn(),
    patch: vi.fn(),
    set: vi.fn(),
    commit: vi.fn(),
    getClient: vi.fn(),
    cookieStore: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
  };
});
vi.mock('server-only', () => ({}));
vi.mock('@/sanity/lib/serverClient', () => ({
  getCredentialClient: mocks.getClient,
}));
vi.mock('@shared/lib/auth/password', () => ({
  verifyPassword: vi.fn(
    async (password, hash) =>
      (password === 'old-pass' && hash === mocks.oldHash) ||
      (password === 'New-Password1!' && hash === mocks.nextHash)
  ),
  hashPassword: vi.fn(async () => mocks.nextHash),
}));
vi.mock('@shared/lib/auth/session', () => ({
  verifySession: vi.fn(() => ({ valid: true, username: 'editor' })),
  createSession: vi.fn(() => 'fixture-session'),
}));
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mocks.cookieStore),
}));
vi.mock('@shared/config', () => ({ env: { NODE_ENV: 'production' } }));
vi.mock('@shared/utils/rate-limit/authRateLimit', () => ({
  getClientIP: () => '127.0.0.1',
  checkLoginRateLimit: () => ({ allowed: true }),
  checkPasswordChangeRateLimit: () => ({ allowed: true }),
}));

const request = (body: unknown) =>
  new NextRequest('https://fixture.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.state.password = mocks.oldHash;
  mocks.getClient.mockReturnValue({ fetch: mocks.fetch, patch: mocks.patch });
  mocks.fetch.mockImplementation(async (_query, params, options) => {
    expect(params.id).toBe(CMS_CREDENTIALS_ID);
    expect(options).toEqual({ cache: 'no-store', perspective: 'raw' });
    return { username: 'editor', password: mocks.state.password };
  });
  mocks.patch.mockReturnValue({ set: mocks.set });
  mocks.set.mockImplementation((values) => {
    mocks.commit.mockImplementation(async () => {
      mocks.state.password = values.password;
    });
    return { commit: mocks.commit };
  });
  mocks.cookieStore.get.mockReturnValue({ value: 'fixture-session' });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

function assertNoSecrets(body: unknown) {
  const serialized = JSON.stringify(body);
  for (const value of [
    mocks.oldHash,
    mocks.nextHash,
    'old-pass',
    'New-Password1!',
    'secret-api-token',
  ]) {
    expect(serialized).not.toContain(value);
  }
}

describe('Auth routes with real protected credential helpers and mocked SDK', () => {
  it('logs in, changes password, and immediately rejects the old password without caching', async () => {
    expect(
      (await login(request({ username: 'editor', password: 'old-pass' })))
        .status
    ).toBe(200);
    const changed = await changePassword(
      request({
        currentPassword: 'old-pass',
        newPassword: 'New-Password1!',
        confirmPassword: 'New-Password1!',
      })
    );
    expect(changed.status).toBe(200);
    assertNoSecrets(await changed.json());
    expect(mocks.patch).toHaveBeenCalledWith(CMS_CREDENTIALS_ID);
    expect(mocks.cookieStore.delete).toHaveBeenCalledWith('sanity-cms-session');
    const old = await login(
      request({ username: 'editor', password: 'old-pass' })
    );
    expect(old.status).toBe(401);
    assertNoSecrets(await old.json());
    const next = await login(
      request({
        username: 'editor',
        password: 'New-Password1!',
        rememberMe: true,
      })
    );
    expect(next.status).toBe(200);
    assertNoSecrets(await next.json());
    expect(mocks.fetch).toHaveBeenCalledTimes(4);
  });

  it('still returns the authenticated username, never credentials, from session verification', async () => {
    const response = await verify();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ username: 'editor' });
    assertNoSecrets(body);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it.each(['missing token', 'read denied'] as const)(
    'fails closed after %s without leaking logs or trying a root document',
    async (failure) => {
      const sdkError = new Error(
        `Authorization: secret-api-token; ${mocks.oldHash}`
      );
      if (failure === 'missing token')
        mocks.getClient.mockImplementation(() => {
          throw sdkError;
        });
      else mocks.fetch.mockRejectedValue(sdkError);
      const response = await login(
        request({ username: 'editor', password: 'old-pass' })
      );
      expect(response.status).toBe(401);
      assertNoSecrets(await response.json());
      assertNoSecrets(vi.mocked(console.error).mock.calls);
      expect(mocks.fetch.mock.calls.length).toBe(
        failure === 'missing token' ? 0 : 1
      );
    }
  );

  it('does not log a failed write payload or clear the session on failure', async () => {
    mocks.set.mockReturnValue({
      commit: vi
        .fn()
        .mockRejectedValue(new Error(`secret-api-token ${mocks.nextHash}`)),
    });
    const response = await changePassword(
      request({
        currentPassword: 'old-pass',
        newPassword: 'New-Password1!',
        confirmPassword: 'New-Password1!',
      })
    );
    expect(response.status).toBe(500);
    assertNoSecrets(await response.json());
    assertNoSecrets(vi.mocked(console.error).mock.calls);
    expect(mocks.cookieStore.delete).not.toHaveBeenCalled();
  });
});
