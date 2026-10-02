// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hashPassword, verifyPassword } from '@shared/lib/auth/password';
import { validatePasswordStrength } from '@shared/utils/password/passwordValidation';

const { hash, compare } = vi.hoisted(() => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));
vi.mock('bcryptjs', () => ({ default: { hash, compare } }));

beforeEach(() => vi.resetAllMocks());

describe('bcrypt password helpers', () => {
  it('preserves the salt rounds and returns the provider hash', async () => {
    hash.mockResolvedValue('stored-hash');
    await expect(hashPassword('Example1!')).resolves.toBe('stored-hash');
    expect(hash).toHaveBeenCalledExactlyOnceWith('Example1!', 12);
  });

  it.each([true, false])(
    'returns the bcrypt verification result %s',
    async (valid) => {
      compare.mockResolvedValue(valid);
      await expect(verifyPassword('Example1!', 'stored-hash')).resolves.toBe(
        valid
      );
      expect(compare).toHaveBeenCalledExactlyOnceWith(
        'Example1!',
        'stored-hash'
      );
    }
  );

  it('continues to propagate bcrypt failures to the caller', async () => {
    const error = new Error('bcrypt failed');
    hash.mockRejectedValue(error);
    compare.mockRejectedValue(error);
    await expect(hashPassword('Example1!')).rejects.toBe(error);
    await expect(verifyPassword('Example1!', 'stored-hash')).rejects.toBe(
      error
    );
  });
});

describe('relocated password-strength validation', () => {
  const errors = [
    'Password must be at least 8 characters long',
    'Password must contain at least one uppercase letter (A-Z)',
    'Password must contain at least one lowercase letter (a-z)',
    'Password must contain at least one number (0-9)',
    'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
  ];

  it('keeps all error messages and their order for an empty password', () => {
    expect(validatePasswordStrength('')).toEqual({ valid: false, errors });
  });

  it.each([
    ['Ab1!', 0],
    ['abcdef1!', 1],
    ['ABCDEF1!', 2],
    ['Abcdefg!', 3],
    ['Abcdef12', 4],
  ] as const)('keeps the existing rule for %s', (password, index) => {
    expect(validatePasswordStrength(password)).toEqual({
      valid: false,
      errors: [errors[index]],
    });
  });

  it.each(Array.from('!@#$%^&*()_+-=[]{}|;:,.<>?'))(
    'accepts the existing special character %s',
    (character) => {
      expect(validatePasswordStrength(`Abcdef1${character}`)).toEqual({
        valid: true,
        errors: [],
      });
    }
  );

  it('keeps whitespace and unsupported punctuation behavior unchanged', () => {
    expect(validatePasswordStrength(' Abcdef1! ')).toEqual({
      valid: true,
      errors: [],
    });
    expect(validatePasswordStrength('        ')).toEqual({
      valid: false,
      errors: errors.slice(1),
    });
    expect(validatePasswordStrength('Abcdef1/')).toEqual({
      valid: false,
      errors: [errors[4]],
    });
  });
});
