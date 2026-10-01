// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSession, verifySession } from '@shared/lib/auth/session';

const { sign, verify } = vi.hoisted(() => ({ sign: vi.fn(), verify: vi.fn() }));
vi.mock('jsonwebtoken', () => ({ default: { sign, verify } }));
vi.mock('@shared/config', () => ({
  env: {
    SANITY_CMS_SESSION_SECRET: 'test-session-secret',
    SANITY_CMS_SESSION_MAX_AGE: 3_600,
    SANITY_CMS_REMEMBER_MAX_AGE: 7_200,
  },
}));

beforeEach(() => vi.resetAllMocks());

describe('JWT session helpers', () => {
  it('preserves username payload and the configured default lifetime', () => {
    sign.mockReturnValue('signed-token');
    expect(createSession('editor')).toBe('signed-token');
    expect(sign).toHaveBeenCalledExactlyOnceWith(
      { username: 'editor' },
      'test-session-secret',
      { expiresIn: '3600s' }
    );
  });

  it.each([
    [false, '3600s'],
    [true, '7200s'],
  ] as const)(
    'preserves configured lifetime with rememberMe=%s',
    (rememberMe, expiresIn) => {
      createSession('editor', rememberMe);
      expect(sign).toHaveBeenCalledExactlyOnceWith(
        { username: 'editor' },
        'test-session-secret',
        { expiresIn }
      );
    }
  );

  it('continues to propagate token-signing failures', () => {
    const error = new Error('JWT signing failed');
    sign.mockImplementation(() => {
      throw error;
    });
    expect(() => createSession('editor')).toThrow(error);
  });

  it('verifies with the configured secret and returns the existing result shape', () => {
    verify.mockReturnValue({ username: 'editor', exp: 2_000 });
    expect(verifySession('signed-token')).toEqual({
      valid: true,
      username: 'editor',
    });
    expect(verify).toHaveBeenCalledExactlyOnceWith(
      'signed-token',
      'test-session-secret'
    );
  });

  it.each(['JsonWebTokenError', 'TokenExpiredError'])(
    'returns invalid when JWT rejects with %s',
    (name) => {
      const error = Object.assign(new Error('JWT rejected'), { name });
      verify.mockImplementation(() => {
        throw error;
      });
      expect(verifySession('rejected-token')).toEqual({ valid: false });
    }
  );
});
