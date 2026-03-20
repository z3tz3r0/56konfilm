import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          This page could not be found.
        </p>
        <Link
          href="/"
          className="bg-foreground text-background mt-8 inline-block rounded-md px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
        >
          Go home
        </Link>
      </div>
    </section>
  );
}
