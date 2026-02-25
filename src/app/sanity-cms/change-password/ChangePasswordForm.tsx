'use client';

import { useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type State = {
  error: string | null;
  errors: string[];
  success: boolean;
  isLoading: boolean;
};

type Action =
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'SUBMIT_ERRORS'; payload: string[] }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SUBMIT_START':
      return { error: null, errors: [], success: false, isLoading: true };
    case 'SUBMIT_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SUBMIT_ERRORS':
      return { ...state, errors: action.payload, isLoading: false };
    case 'SUBMIT_SUCCESS':
      return { ...state, success: true, isLoading: false };
    case 'RESET':
      return { error: null, errors: [], success: false, isLoading: false };
  }
}

const initialState: State = {
  error: null,
  errors: [],
  success: false,
  isLoading: false,
};

export default function ChangePasswordForm() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    getValues,
  } = useForm<ChangePasswordFormData>();

  const onSubmit = async (data: ChangePasswordFormData) => {
    dispatch({ type: 'SUBMIT_START' });

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
          dispatch({ type: 'SUBMIT_ERRORS', payload: result.errors });
        } else {
          dispatch({
            type: 'SUBMIT_ERROR',
            payload: result.error || 'Failed to change password',
          });
        }
        return;
      }

      dispatch({ type: 'SUBMIT_SUCCESS' });

      setTimeout(() => {
        router.push('/sanity-cms/login');
      }, 2000);
    } catch {
      dispatch({
        type: 'SUBMIT_ERROR',
        payload: 'An error occurred. Please try again.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-[#252525] p-8 shadow-xl">
          <h1 className="mb-6 text-center text-2xl font-bold text-white">
            Change Password
          </h1>

          {state.success && (
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
                disabled={state.isLoading}
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
                disabled={state.isLoading}
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
                    value === getValues('newPassword') ||
                    'Passwords do not match',
                })}
                className="w-full rounded-md border border-gray-600 bg-[#1a1a1a] px-4 py-2 text-white placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Confirm your new password"
                disabled={state.isLoading}
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.confirmPassword.message}
                </p>
              )}
            </div>

            {state.error && (
              <div className="rounded-md border border-red-700 bg-red-900/30 p-3">
                <p className="text-sm text-red-400">{state.error}</p>
              </div>
            )}

            {state.errors.length > 0 && (
              <div className="rounded-md border border-red-700 bg-red-900/30 p-3">
                <p className="mb-2 text-sm font-medium text-red-400">
                  Password requirements:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-red-400">
                  {state.errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={state.isLoading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.isLoading ? 'Changing password...' : 'Change Password'}
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
