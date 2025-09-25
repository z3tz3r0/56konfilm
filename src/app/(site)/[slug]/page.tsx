import PageBuilder from '@/components/page/PageBuilder';
import { resolvePreferences } from '@/lib/i18nUtils';
import { client } from '@/sanity/lib/client';
import { pageBySlugQuery } from '@/sanity/lib/queries';
import { PageDocument } from '@/types/sanity';
import { notFound } from 'next/navigation';

const PAGE_REVALIDATE_SECONDS = 3600;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

async function fetchPageDocument(slug: string): Promise<PageDocument | null> {
  const { locale, mode } = await resolvePreferences();

  const page = await client.fetch<PageDocument | null>(
    pageBySlugQuery,
    { slug, lang: locale, mode },
    { next: { revalidate: PAGE_REVALIDATE_SECONDS } }
  );

  return page;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const page = await fetchPageDocument(slug);

  if (!page) {
    notFound();
  }

  return <PageBuilder page={page} />;
}
