'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    watch,
  } = useForm<ChangePasswordFormData>();

  const newPassword = watch('newPassword');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        const result = await response.json();

        if (result.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/sanity-cms/login');
        }
      } catch {
        setIsAuthenticated(false);
        router.push('/sanity-cms/login');
      }
    };

    checkAuth();
  }, [router]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setErrors([]);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          setErrors(result.errors);
        } else {
          setError(result.error || 'Failed to change password');
        }
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/sanity-cms/login');
      }, 2000);
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-[#252525] p-8 shadow-xl">
          <h1 className="mb-6 text-center text-2xl font-bold text-white">
            Change Password
          </h1>

          {success && (
            <div className="mb-4 rounded-md border border-green-700 bg-green-900/30 p-3">
              <p className="text-sm text-green-400">
                Password changed successfully! Redirecting to login...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                {...register('currentPassword', {
                  required: 'Current password is required',
                })}
                className="w-full rounded-md border border-gray-600 bg-[#1a1a1a] px-4 py-2 text-white placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your current password"
                disabled={isLoading}
              />
              {formErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                {...register('newPassword', {
                  required: 'New password is required',
                })}
                className="w-full rounded-md border border-gray-600 bg-[#1a1a1a] px-4 py-2 text-white placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your new password"
                disabled={isLoading}
              />
              {formErrors.newPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (value) =>
                    value === newPassword || 'Passwords do not match',
                })}
                className="w-full rounded-md border border-gray-600 bg-[#1a1a1a] px-4 py-2 text-white placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Confirm your new password"
                disabled={isLoading}
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-md border border-red-700 bg-red-900/30 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {errors.length > 0 && (
              <div className="rounded-md border border-red-700 bg-red-900/30 p-3">
                <p className="mb-2 text-sm font-medium text-red-400">
                  Password requirements:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-red-400">
                  {errors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Changing password...' : 'Change Password'}
            </button>

            <div className="text-center">
              <Link
                href="/sanity-cms"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                ← Back to Studio
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
