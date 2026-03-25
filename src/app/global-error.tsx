'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background flex min-h-screen items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <p className="mt-4 text-lg text-white/70">
            {error.digest
              ? `Error ID: ${error.digest}`
              : 'An unexpected error occurred.'}
          </p>
          <button
            onClick={reset}
            className="mt-8 rounded-md bg-white px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-80"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
