import { notFound, redirect } from 'next/navigation';

import { resolvePreferences } from '@/lib/i18nUtils';
import { client } from '@/sanity/lib/client';
import { firstPageSlugByModeQuery } from '@/sanity/lib/queries';
import { Metadata } from 'next';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { mode } = await resolvePreferences();

  const result = await client.fetch<{ slug?: string | null }>(
    firstPageSlugByModeQuery,
    { mode },
    { next: { revalidate: 3600 } }
  );

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
