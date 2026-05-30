import PageBuilder from '@features/PageBuilder';
import { buildMetadata } from '@shared/lib/seo';
import { Locale, SiteMode } from '@shared/config';
import { Metadata } from 'next';
import { ContentService } from '@/services';
import { getMockPage } from './page.mock';
import { notFound } from 'next/navigation';
import { PortfolioPage } from './_components';
import { cookies } from 'next/headers';
import { sanitizePaginationLimit } from '@shared/utils';

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
  const cookieStore = await cookies();

  const parsedPage = Number(currentSearchParams?.page);
  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 1 ? parsedPage : 1;

  const rawLimit =
    currentSearchParams?.limit || cookieStore.get('portfolio_limit')?.value;
  const currentLimit = Number(sanitizePaginationLimit(rawLimit));

  const isMockMode =
    process.env.E2E_TEST === '1' || currentSearchParams?.e2e === '1';
  const currentTag = currentSearchParams?.tag || '';

  const [page, settings] = await Promise.all([
    isMockMode
      ? getMockPage(mode, firstSegment)
      : ContentService.getPage({ lang, mode, slug: firstSegment }),
    ContentService.getSetting({ lang }),
  ]);
  if (!page) notFound();

  const commonProps = { page, lang, mode };

  const isPortfolioPage =
    mode === 'production'
      ? firstSegment === settings?.productionPortfolioSlug
      : firstSegment === settings?.weddingPortfolioSlug;

  if (isPortfolioPage) {
    const [projectData, tags] = await Promise.all([
      ContentService.getAllProjects({
        lang,
        mode,
        tag: currentTag,
        page: currentPage,
        limit: currentLimit,
      }),
      ContentService.getAllProjectTags({ lang, mode }),
    ]);

    return (
      <PortfolioPage
        projects={projectData.projects}
        tags={tags || []}
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={projectData.totalPages}
        isMockMode={isMockMode}
        portfolioSlug={firstSegment}
        {...commonProps}
      />
    );
  }

  return <PageBuilder enableSignature={isMockMode} {...commonProps} />;
}
