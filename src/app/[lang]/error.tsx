'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          {error.digest ? `Error ID: ${error.digest}` : 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="bg-foreground text-background mt-8 rounded-md px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
