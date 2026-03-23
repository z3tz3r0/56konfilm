import type { MetadataRoute } from 'next';
import { getBaseURL } from '@shared/utils';
import { SUPPORTED_LOCALES } from '@shared/config';
import { ContentService } from '@/services';

const SITE_BASE_URL = getBaseURL();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allPageSlugs, allProjectSlugs, settings] = await Promise.all([
    ContentService.getAllPageSlugs(),
    ContentService.getAllProjectSlugs(),
    ContentService.getSetting({ lang: 'en' }),
  ]);

  const homeEntries: MetadataRoute.Sitemap = allPageSlugs.flatMap((page) =>
    SUPPORTED_LOCALES.map((lang) => ({
      url: `${SITE_BASE_URL}/${lang}/${page.siteMode}`,
      lastModified: page._updatedAt ? new Date(page._updatedAt) : new Date(),
      alternates: {
        languages: {
          th: `${SITE_BASE_URL}/th/${page.siteMode}`,
          en: `${SITE_BASE_URL}/en/${page.siteMode}`,
        },
      },
      changeFrequency: 'daily',
      priority: 1,
    }))
  );

  const pageEntries: MetadataRoute.Sitemap = allPageSlugs.flatMap((page) =>
    SUPPORTED_LOCALES.map((lang) => ({
      url: `${SITE_BASE_URL}/${lang}/${page.siteMode}/${page.slug}`,
      lastModified: page._updatedAt ? new Date(page._updatedAt) : new Date(),
      changeFrequency: 'weekly',
      alternates: {
        languages: {
          th: `${SITE_BASE_URL}/th/${page.siteMode}/${page.slug}`,
          en: `${SITE_BASE_URL}/en/${page.siteMode}/${page.slug}`,
        },
      },
      priority: 0.8,
    }))
  );

  const projectEntries: MetadataRoute.Sitemap = allProjectSlugs.flatMap(
    (project) =>
      SUPPORTED_LOCALES.map((lang) => {
        const portfolioSlug =
          project.siteMode === 'production'
            ? settings.productionPortfolioPage
            : settings.weddingPortfolioPage;
        return {
          url: `${SITE_BASE_URL}/${lang}/${project.siteMode}/${portfolioSlug}/${project.slug}`,
          lastModified: project._updatedAt
            ? new Date(project._updatedAt)
            : new Date(),
          alternates: {
            languages: {
              th: `${SITE_BASE_URL}/th/${project.siteMode}/${portfolioSlug}/${project.slug}`,
              en: `${SITE_BASE_URL}/en/${project.siteMode}/${portfolioSlug}/${project.slug}`,
            },
          },
          changeFrequency: 'weekly',
          priority: 0.7,
        };
      })
  );

  return [...homeEntries, ...pageEntries, ...projectEntries];
}
