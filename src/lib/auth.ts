import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { client, writeClient } from '@/sanity/lib/client';
import {
  sanityCmsSessionSecret,
  sanityCmsSessionMaxAge,
  sanityCmsRememberMaxAge,
} from '@/sanity/env';

const SALT_ROUNDS = 12;
const SESSION_SECRET = sanityCmsSessionSecret;
const DEFAULT_MAX_AGE = sanityCmsSessionMaxAge; // 7 days
const REMEMBER_MAX_AGE = sanityCmsRememberMaxAge; // 30 days

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create JWT session token
 */
export function createSession(
  username: string,
  rememberMe: boolean = false
): string {
  const maxAge = rememberMe ? REMEMBER_MAX_AGE : DEFAULT_MAX_AGE;

  return jwt.sign(
    {
      username,
      // Don't set 'exp' here - jwt.sign() will calculate it from expiresIn option
    },
    SESSION_SECRET as string,
    {
      expiresIn: `${maxAge}s`,
    }
  );
}

/**
 * Verify JWT session token
 */
export function verifySession(token: string): {
  valid: boolean;
  username?: string;
} {
  try {
    const decoded = jwt.verify(token, SESSION_SECRET as string) as {
      username: string;
      exp: number;
    };
    return {
      valid: true,
      username: decoded.username,
    };
  } catch {
    return {
      valid: false,
    };
  }
}

/**
 * Get credentials from Sanity
 */
export async function getCredentialsFromSanity(): Promise<{
  username: string;
  password: string;
} | null> {
  try {
    const credentials = await client.fetch<{
      username: string;
      password: string;
    } | null>(
      `*[_type == "cmsCredentials" && _id == "cms-credentials"][0] {
        username,
        password
      }`
    );

    return credentials;
  } catch (error) {
    console.error('Error fetching credentials from Sanity:', error);
    return null;
  }
}

/**
 * Update password in Sanity
 */
export async function updatePasswordInSanity(
  newPasswordHash: string
): Promise<void> {
  try {
    await writeClient
      .patch('cms-credentials')
      .set({
        password: newPasswordHash,
        updatedAt: new Date().toISOString(),
      })
      .commit();
  } catch (error) {
    console.error('Error updating password in Sanity:', error);
    throw new Error('Failed to update password');
  }
}

/**
 * Validate password strength (industry standard)
 */
export function validatePasswordStrength(
  password: string
): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push(
      'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
