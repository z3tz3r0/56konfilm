import PageBuilder from '@/components/page/PageBuilder';
import { resolvePreferences } from '@/lib/i18nUtils';
import { client } from '@/sanity/lib/client';
import { pageBySlugQuery } from '@/sanity/lib/queries';
import { PageDocument } from '@/types/sanity';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const PAGE_REVALIDATE_SECONDS = 3600;

interface PageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  
  // Base URL should ideally be from env, but assuming relative path works for next JS internal handling
  // or we can just leave it as /... if Next handles domain. 
  // Next.js metadata API expects absolute or relative. alternates.languages usually relative?
  // Documentation says: "If a string is provided, it is resolved against the metadataBase."
  
  return {
    alternates: {
      canonical: `/${lang}/${slug}`,
      languages: {
        en: `/en/${slug}`,
        th: `/th/${slug}`,
      },
    },
  };
}

async function fetchPageDocument(slug: string, lang: string): Promise<PageDocument | null> {
  const { mode } = await resolvePreferences();

  const page = await client.fetch<PageDocument | null>(
    pageBySlugQuery,
    { slug, lang, mode },
    { next: { revalidate: PAGE_REVALIDATE_SECONDS } }
  );

  return page;
}

export default async function Page({ params }: PageProps) {
  const { lang, slug } = await params;

  const page = await fetchPageDocument(slug, lang);

  if (!page) {
    notFound();
  }

  return <PageBuilder page={page} />;
}

