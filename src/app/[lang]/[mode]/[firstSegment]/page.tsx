import PageBuilder from '@features/PageBuilder';
import { buildMetadata } from '@shared/lib/seo';
import { Locale, SiteMode } from '@shared/config';
import { Metadata } from 'next';
import { ContentService } from '@/services';
import { getMockPage } from './page.mock';
import { notFound } from 'next/navigation';
import { PortfolioPage } from './_components';

interface PageProps {
  params: Promise<{
    lang: Locale;
    mode: SiteMode;
    firstSegment: string;
  }>;
  searchParams?: Promise<{
    e2e?: string;
    tag?: string;
    page?: string;
    limit?: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, mode, firstSegment } = await params;

  const [page, settings] = await Promise.all([
    ContentService.getPage({ lang, mode, slug: firstSegment }),
    ContentService.getSetting({ lang }),
  ]);

  return buildMetadata({
    lang,
    mode,
    pathname: `/${lang}/${mode}/${firstSegment}`,
    title: page?.title,
    seo: page?.seo,
    fallbackSeo: settings?.seo,
    fallbackTitle: settings?.siteTitle,
    siteTitle: settings?.siteTitle,
  });
}

export default async function Page({ params, searchParams }: PageProps) {
  const { lang, mode, firstSegment } = await params;

  const currentSearchParams = await searchParams;
  const isMockMode =
    process.env.E2E_TEST === '1' || currentSearchParams?.e2e === '1';
  const currentTag = currentSearchParams?.tag || '';
  const currentPage = Number(currentSearchParams?.page) || 1;
  const currentLimit = Number(currentSearchParams?.limit) || 6;

  const [page, settings, projectData, tags] = await Promise.all([
    isMockMode
      ? getMockPage(mode, firstSegment)
      : ContentService.getPage({ lang, mode, slug: firstSegment }),
    ContentService.getSetting({ lang }),
    ContentService.getAllProjects({
      lang,
      mode,
      tag: currentTag,
      page: currentPage,
      limit: currentLimit,
    }),
    ContentService.getAllProjectTags({ lang }),
  ]);
  if (!page) notFound();

  const commonProps = { page, lang, mode };

  const isPortfolioPage =
    mode === 'production'
      ? firstSegment === settings?.productionPortfolioSlug
      : firstSegment === settings?.weddingPortfolioSlug;

  if (isPortfolioPage) {
    return (
      <PortfolioPage
        projects={projectData.projects}
        tags={tags || []}
        currentPage={currentPage}
        totalPages={projectData.totalPages}
        isMockMode={isMockMode}
        {...commonProps}
      />
    );
  }

  return <PageBuilder enableSignature={isMockMode} {...commonProps} />;
}
