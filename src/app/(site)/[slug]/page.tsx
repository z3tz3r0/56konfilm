import { loadPageData } from '@/lib/page-data';

interface Params {
  slug: string;
}

interface PageProps {
  params: Params;
}

export default async function SitePage({ params }: PageProps) {
  const page = await loadPageData(params.slug);

  return (
    <main className="container py-16">
      <pre className="rounded-lg bg-muted p-6 text-sm leading-relaxed">
        {JSON.stringify(page, null, 2)}
      </pre>
    </main>
  );
}
