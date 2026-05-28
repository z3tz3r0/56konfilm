import PageBuilder from '@features/PageBuilder';
import { buildMetadata } from '@shared/lib/seo';
import { Locale, SiteMode } from '@shared/config';
import { Metadata } from 'next';
import { ContentService } from '@/services';
import { getMockPage } from './page.mock';
import { notFound } from 'next/navigation';
import PortfolioPage from '@/app/[lang]/[mode]/[firstSegment]/_components/PortfolioPage';

interface PageProps {
  params: Promise<{
    lang: Locale;
    mode: SiteMode;
    firstSegment: string;
  }>;
  searchParams?: Promise<{
    e2e?: string;
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
  const mockParams = await searchParams;
  const isMockMode = process.env.E2E_TEST === '1' || mockParams?.e2e === '1';

  const [page, settings, projects] = await Promise.all([
    isMockMode
      ? getMockPage(mode, firstSegment)
      : ContentService.getPage({ lang, mode, slug: firstSegment }),
    ContentService.getSetting({ lang }),
    ContentService.getAllProjects({ lang, mode }),
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
        projects={projects}
        isMockMode={isMockMode}
        {...commonProps}
      />
    );
  }

  return <PageBuilder enableSignature={isMockMode} {...commonProps} />;
}
