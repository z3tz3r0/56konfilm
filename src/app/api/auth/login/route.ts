import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getCredentialsFromSanity,
  verifyPassword,
  createSession,
} from '@/lib/auth';
import { checkLoginRateLimit, getClientIP } from '@/lib/rateLimit';
import { nodeEnv } from '@/sanity/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, rememberMe } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const ip = getClientIP(request);
    const rateLimit = checkLoginRateLimit(ip);

    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 1000 / 60);
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please try again in ${resetIn} minutes.`,
        },
        { status: 429 }
      );
    }

    // Fetch credentials from Sanity
    const credentials = await getCredentialsFromSanity();

    // Generic error message for security (don't reveal if username exists)
    const genericError = 'Invalid username or password';

    if (!credentials) {
      return NextResponse.json(
        { success: false, error: genericError },
        { status: 401 }
      );
    }

    // Check username
    if (credentials.username !== username) {
      return NextResponse.json(
        { success: false, error: genericError },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, credentials.password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: genericError },
        { status: 401 }
      );
    }

    // Create session
    const token = createSession(username, rememberMe === true);
    const maxAge = rememberMe ? 2592000 : 604800; // 30 days or 7 days

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('sanity-cms-session', token, {
      httpOnly: true,
      secure: nodeEnv === 'production',
      sameSite: 'strict',
      maxAge,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
