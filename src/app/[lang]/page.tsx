import { notFound, redirect } from 'next/navigation';

import { resolvePreferences } from '@/lib/i18nUtils';
import { sanityFetch } from '@/sanity/lib/fetch';
import { firstPageSlugByModeQuery } from '@/sanity/lib/queries';
import { Metadata } from 'next';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { mode } = await resolvePreferences();

  const result = await sanityFetch<{ slug?: string | null }>({
    query: firstPageSlugByModeQuery,
    params: { mode },
    tags: ['page'],
  });

  if (result?.slug) {
    redirect(`/${lang}/${result.slug}`);
  }

  notFound();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return {
    alternates: {
      canonical: `/${lang}`,
      languages: {
        en: '/en',
        th: '/th',
      },
    },
  };
}
