import PageBuilder from '@features/PageBuilder';
import { Locale, SiteMode } from '@shared/config';
import { ContentService } from '@/services';
import { notFound } from 'next/navigation';

interface HomePageProps {
  params: Promise<{ lang: Locale; mode: SiteMode }>;
  searchParams?: Promise<{
    e2e?: string;
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang, mode } = await params;

  const homePage = await ContentService.getPage({ lang, mode, slug: 'home' });
  if (!homePage) notFound();

  return <PageBuilder page={homePage} lang={lang} mode={mode} />;
}
