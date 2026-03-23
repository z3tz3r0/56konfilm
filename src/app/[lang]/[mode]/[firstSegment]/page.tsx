import PageBuilder, { FullPageDocument } from '@features/PageBuilder';
import { buildMetadata } from '@shared/lib/seo';
import { Locale, SiteMode } from '@shared/config';
import { Metadata } from 'next';
import { ContentService } from '@/services';
import { getMockPage } from './page.mocks';
import { notFound } from 'next/navigation';

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

  const page: FullPageDocument | null = isMockMode
    ? getMockPage(mode, firstSegment)
    : await ContentService.getPage({ lang, mode, slug: firstSegment });
  if (!page) notFound();

  return (
    <PageBuilder
      page={page}
      lang={lang}
      mode={mode}
      enableSignature={isMockMode}
    />
  );
}
