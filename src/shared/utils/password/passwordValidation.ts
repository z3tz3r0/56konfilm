interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
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
