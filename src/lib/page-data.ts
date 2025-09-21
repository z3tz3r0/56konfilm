import { notFound } from 'next/navigation';

import { client } from '@/sanity/lib/client';
import { pageBySlugQuery } from '@/sanity/lib/queries';
import { resolvePreferences } from '@/lib/i18nUtils';

export async function loadPageData(slug: string) {
  const { locale, mode } = await resolvePreferences();

  try {
    const page = await client.fetch(pageBySlugQuery, { slug, lang: locale, mode });

    if (!page) {
      notFound();
    }

    return page;
  } catch (error) {
    console.error('Failed to load page data:', error);
    notFound();
  }
}
