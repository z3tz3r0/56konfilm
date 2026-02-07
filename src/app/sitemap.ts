import type { MetadataRoute } from 'next';

import { sanityFetch } from '@/sanity/lib/fetch';
import { allPageSlugsQuery, allProjectSlugsQuery } from '@/sanity/lib/queries';

type RouteSlug = {
  slug: string;
};

function getSiteBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

const SITE_BASE_URL = getSiteBaseUrl();
const LANGS = ['en', 'th'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, projects] = await Promise.all([
    sanityFetch<RouteSlug[]>({
      query: allPageSlugsQuery,
      tags: ['page'],
    }),
    sanityFetch<RouteSlug[]>({
      query: allProjectSlugsQuery,
      tags: ['project'],
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = LANGS.map((lang) => ({
    url: `${SITE_BASE_URL}/${lang}`,
    changeFrequency: 'daily',
    priority: 1,
  }));

  const pageEntries: MetadataRoute.Sitemap = pages.flatMap((page) =>
    LANGS.map((lang) => ({
      url: `${SITE_BASE_URL}/${lang}/${page.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );

  const projectEntries: MetadataRoute.Sitemap = projects.flatMap((project) =>
    LANGS.map((lang) => ({
      url: `${SITE_BASE_URL}/${lang}/work/${project.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  return [...staticEntries, ...pageEntries, ...projectEntries];
}
