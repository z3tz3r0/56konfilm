import jwt from 'jsonwebtoken';
import { env } from '@shared/config';

const SESSION_SECRET = env.SANITY_CMS_SESSION_SECRET;
const DEFAULT_MAX_AGE = env.SANITY_CMS_SESSION_MAX_AGE; // 7 days
const REMEMBER_MAX_AGE = env.SANITY_CMS_REMEMBER_MAX_AGE; // 30 days

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
