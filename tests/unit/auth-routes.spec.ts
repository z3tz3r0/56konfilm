// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as changePassword } from '@/app/api/auth/change-password/route';
import { GET as verify } from '@/app/api/auth/verify/route';

const { auth, limiter, cookieStore, cookies, testEnv } = vi.hoisted(() => ({
  auth: {
    getCredentialsFromSanity: vi.fn(),
    verifyPassword: vi.fn(),
    createSession: vi.fn(),
    verifySession: vi.fn(),
    hashPassword: vi.fn(),
    updatePasswordInSanity: vi.fn(),
  },
  limiter: {
    getClientIP: vi.fn(),
    checkLoginRateLimit: vi.fn(),
    checkPasswordChangeRateLimit: vi.fn(),
  },
  cookieStore: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
  cookies: vi.fn(),
  testEnv: { NODE_ENV: 'production' },
}));

vi.mock('@shared/lib/auth', () => auth);
vi.mock('@shared/utils/rate-limit/authRateLimit', () => limiter);
vi.mock('next/headers', () => ({ cookies }));
vi.mock('@shared/config', () => ({ env: testEnv }));

const credentials = { username: 'editor', password: 'stored-hash' };
const loginValues = { username: 'editor', password: 'old-password' };
const passwordValues = {
  currentPassword: 'old-password',
  newPassword: 'Abcdef1!',
  confirmPassword: 'Abcdef1!',
};

function request(body: unknown) {
  return new NextRequest('https://example.com/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function expectFailure(
  response: Response,
  status: number,
  error: string
) {
  expect(response.status).toBe(status);
  expect(await response.json()).toMatchObject({ success: false, error });
  expect(cookieStore.set).not.toHaveBeenCalled();
  expect(cookieStore.delete).not.toHaveBeenCalled();
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(Date, 'now').mockReturnValue(1_000);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  testEnv.NODE_ENV = 'production';
  cookies.mockResolvedValue(cookieStore);
  cookieStore.get.mockReturnValue({ value: 'session-token' });
  auth.getCredentialsFromSanity.mockResolvedValue(credentials);
  auth.verifyPassword.mockResolvedValueOnce(true).mockResolvedValue(false);
  auth.createSession.mockReturnValue('signed-token');
  auth.verifySession.mockReturnValue({ valid: true, username: 'editor' });
  auth.hashPassword.mockResolvedValue('new-hash');
  auth.updatePasswordInSanity.mockResolvedValue(undefined);
  limiter.getClientIP.mockReturnValue('203.0.113.1');
  limiter.checkLoginRateLimit.mockReturnValue({
    allowed: true,
    remaining: 4,
    resetAt: 901_000,
  });
  limiter.checkPasswordChangeRateLimit.mockReturnValue({
    allowed: true,
    remaining: 2,
    resetAt: 3_601_000,
  });
});

afterEach(() => vi.restoreAllMocks());

describe('login route regression with mocked dependencies', () => {
  it.each([false, true])(
    'preserves success and cookies with rememberMe=%s',
    async (rememberMe) => {
      const response = await login(request({ ...loginValues, rememberMe }));
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        message: 'Login successful',
      });
      expect(limiter.getClientIP).toHaveBeenCalledOnce();
      expect(limiter.checkLoginRateLimit).toHaveBeenCalledExactlyOnceWith(
        '203.0.113.1'
      );
      expect(auth.verifyPassword).toHaveBeenCalledExactlyOnceWith(
        'old-password',
        'stored-hash'
      );
      expect(auth.createSession).toHaveBeenCalledExactlyOnceWith(
        'editor',
        rememberMe
      );
      expect(cookieStore.set).toHaveBeenCalledExactlyOnceWith(
        'sanity-cms-session',
        'signed-token',
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: rememberMe ? 2_592_000 : 604_800,
          path: '/',
        }
      );
    }
  );

  it('preserves default session age and development cookie behavior', async () => {
    testEnv.NODE_ENV = 'development';
    await login(request(loginValues));
    expect(auth.createSession).toHaveBeenCalledExactlyOnceWith('editor', false);
    expect(cookieStore.set.mock.calls[0][2]).toMatchObject({
      secure: false,
      maxAge: 604_800,
    });
  });

  it('rejects missing fields before rate limiting and credential access', async () => {
    await expectFailure(
      await login(request({})),
      400,
      'Username and password are required'
    );
    expect(limiter.checkLoginRateLimit).not.toHaveBeenCalled();
    expect(auth.getCredentialsFromSanity).not.toHaveBeenCalled();
  });

  it('preserves 429 and retry text without accessing credentials', async () => {
    limiter.checkLoginRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: 151_000,
    });
    await expectFailure(
      await login(request(loginValues)),
      429,
      'Too many login attempts. Please try again in 3 minutes.'
    );
    expect(auth.getCredentialsFromSanity).not.toHaveBeenCalled();
    expect(auth.createSession).not.toHaveBeenCalled();
  });

  it.each(['missing credentials', 'wrong username', 'wrong password'])(
    'preserves generic 401 for %s',
    async (reason) => {
      if (reason === 'missing credentials')
        auth.getCredentialsFromSanity.mockResolvedValue(null);
      if (reason === 'wrong username')
        auth.getCredentialsFromSanity.mockResolvedValue({
          ...credentials,
          username: 'another-editor',
        });
      if (reason === 'wrong password')
        auth.verifyPassword.mockReset().mockResolvedValue(false);
      await expectFailure(
        await login(request(loginValues)),
        401,
        'Invalid username or password'
      );
      expect(auth.createSession).not.toHaveBeenCalled();
    }
  );

  it('preserves 500 and the log message on an unexpected failure', async () => {
    const error = new Error('Mocked failure');
    auth.getCredentialsFromSanity.mockRejectedValue(error);
    await expectFailure(
      await login(request(loginValues)),
      500,
      'An error occurred during login'
    );
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      'Login error:',
      error
    );
  });
});

describe('change-password route regression with real password rules', () => {
  it('preserves verification order, password update, and cookie removal on success', async () => {
    const response = await changePassword(request(passwordValues));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      message: 'Password changed successfully',
    });
    expect(auth.verifySession).toHaveBeenCalledExactlyOnceWith('session-token');
    expect(
      limiter.checkPasswordChangeRateLimit
    ).toHaveBeenCalledExactlyOnceWith('editor');
    expect(auth.verifySession.mock.invocationCallOrder[0]).toBeLessThan(
      limiter.checkPasswordChangeRateLimit.mock.invocationCallOrder[0]
    );
    expect(
      limiter.checkPasswordChangeRateLimit.mock.invocationCallOrder[0]
    ).toBeLessThan(auth.getCredentialsFromSanity.mock.invocationCallOrder[0]);
    expect(auth.verifyPassword.mock.calls).toEqual([
      ['old-password', 'stored-hash'],
      ['Abcdef1!', 'stored-hash'],
    ]);
    expect(auth.hashPassword).toHaveBeenCalledExactlyOnceWith('Abcdef1!');
    expect(auth.updatePasswordInSanity).toHaveBeenCalledExactlyOnceWith(
      'new-hash'
    );
    expect(cookieStore.delete).toHaveBeenCalledExactlyOnceWith(
      'sanity-cms-session'
    );
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it('rejects a missing cookie before any Auth operations', async () => {
    cookieStore.get.mockReturnValue(undefined);
    await expectFailure(
      await changePassword(request(passwordValues)),
      401,
      'Not authenticated'
    );
    expect(auth.verifySession).not.toHaveBeenCalled();
    expect(limiter.checkPasswordChangeRateLimit).not.toHaveBeenCalled();
  });

  it.each([{ valid: false }, { valid: true }])(
    'rejects unusable session %j',
    async (session) => {
      auth.verifySession.mockReturnValue(session);
      await expectFailure(
        await changePassword(request(passwordValues)),
        401,
        'Invalid session'
      );
      expect(limiter.checkPasswordChangeRateLimit).not.toHaveBeenCalled();
    }
  );

  it('preserves 429 before credential access or password changes', async () => {
    limiter.checkPasswordChangeRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: 151_000,
    });
    await expectFailure(
      await changePassword(request(passwordValues)),
      429,
      'Too many password change attempts. Please try again in 3 minutes.'
    );
    expect(auth.getCredentialsFromSanity).not.toHaveBeenCalled();
  });

  it.each([
    [
      { ...passwordValues, currentPassword: '' },
      'All password fields are required',
    ],
    [
      { ...passwordValues, confirmPassword: 'different' },
      'New password and confirmation do not match',
    ],
  ])('preserves input failure %j', async (values, error) => {
    await expectFailure(await changePassword(request(values)), 400, error);
    expect(auth.getCredentialsFromSanity).not.toHaveBeenCalled();
  });

  it('returns the same password-strength errors from the relocated utility', async () => {
    const response = await changePassword(
      request({
        ...passwordValues,
        newPassword: 'abcdef12',
        confirmPassword: 'abcdef12',
      })
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      success: false,
      error: 'Password does not meet requirements',
      errors: [
        'Password must contain at least one uppercase letter (A-Z)',
        'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
      ],
    });
    expect(auth.getCredentialsFromSanity).not.toHaveBeenCalled();
    expect(auth.hashPassword).not.toHaveBeenCalled();
    expect(cookieStore.delete).not.toHaveBeenCalled();
  });

  it('preserves missing-credential and incorrect-current-password responses', async () => {
    auth.getCredentialsFromSanity.mockResolvedValueOnce(null);
    await expectFailure(
      await changePassword(request(passwordValues)),
      500,
      'Credentials not found'
    );
    auth.verifyPassword.mockReset().mockResolvedValue(false);
    await expectFailure(
      await changePassword(request(passwordValues)),
      401,
      'Current password is incorrect'
    );
    expect(auth.hashPassword).not.toHaveBeenCalled();
  });

  it('still rejects a new password equal to the current one', async () => {
    auth.verifyPassword.mockReset().mockResolvedValue(true);
    await expectFailure(
      await changePassword(request(passwordValues)),
      400,
      'New password must be different from current password'
    );
    expect(auth.hashPassword).not.toHaveBeenCalled();
  });

  it('does not remove the cookie if the password update fails', async () => {
    const error = new Error('Mocked update failure');
    auth.updatePasswordInSanity.mockRejectedValue(error);
    await expectFailure(
      await changePassword(request(passwordValues)),
      500,
      'An error occurred while changing password'
    );
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      'Change password error:',
      error
    );
  });
});

describe('session-verification route regression', () => {
  it('preserves the authenticated response', async () => {
    const response = await verify();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      authenticated: true,
      username: 'editor',
    });
    expect(auth.verifySession).toHaveBeenCalledExactlyOnceWith('session-token');
  });

  it.each(['missing', 'invalid'])(
    'preserves 401 for a %s session',
    async (state) => {
      if (state === 'missing') cookieStore.get.mockReturnValue(undefined);
      else auth.verifySession.mockReturnValue({ valid: false });
      const response = await verify();
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ authenticated: false });
    }
  );

  it('preserves 500 when reading cookies fails', async () => {
    cookies.mockRejectedValue(new Error('Mocked cookie failure'));
    const response = await verify();
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ authenticated: false });
  });
});
