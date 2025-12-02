import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getCredentialsFromSanity,
  verifyPassword,
  hashPassword,
  updatePasswordInSanity,
  validatePasswordStrength,
  verifySession,
} from '@/lib/auth';
import { checkPasswordChangeRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const cookieStore = await cookies();
    const token = cookieStore.get('sanity-cms-session')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = verifySession(token);

    if (!session.valid || !session.username) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check rate limiting
    const rateLimit = checkPasswordChangeRateLimit(session.username);

    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 1000 / 60);
      return NextResponse.json(
        {
          success: false,
          error: `Too many password change attempts. Please try again in ${resetIn} minutes.`,
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'All password fields are required' },
        { status: 400 }
      );
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);

    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password does not meet requirements',
          errors: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Fetch current credentials
    const credentials = await getCredentialsFromSanity();

    if (!credentials) {
      return NextResponse.json(
        { success: false, error: 'Credentials not found' },
        { status: 500 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      credentials.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(
      newPassword,
      credentials.password
    );

    if (isSamePassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password must be different from current password',
        },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in Sanity
    await updatePasswordInSanity(newPasswordHash);

    // Clear session cookie (force re-login with new password)
    cookieStore.delete('sanity-cms-session');

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while changing password' },
      { status: 500 }
    );
  }
}
