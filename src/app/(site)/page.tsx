import { notFound, redirect } from 'next/navigation';

import { resolvePreferences } from '@/lib/i18nUtils';
import { client } from '@/sanity/lib/client';
import { firstPageSlugByModeQuery } from '@/sanity/lib/queries';

export default async function Home() {
  const { mode } = await resolvePreferences();

  const result = await client.fetch<{ slug?: string | null }>(
    firstPageSlugByModeQuery,
    { mode },
    { next: { revalidate: 3600 } }
  );

  if (result?.slug) {
    redirect(`/${result.slug}`);
  }

  notFound();
}
