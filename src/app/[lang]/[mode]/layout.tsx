import { Footer, Navbar } from '@shared/components';
import { Locale, SiteMode } from '@shared/config';
import { ReactNode } from 'react';
import { ContentService } from '@/services';
import { buildMetadata } from '@shared/lib/seo';
import { Metadata } from 'next';
import { isSupportedLocale, isSupportedMode } from '@shared/utils';
import { notFound } from 'next/navigation';

interface SiteLayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string; mode: string }>;
}

export default async function SiteLayout({
  children,
  params,
}: SiteLayoutProps) {
  const { lang, mode } = await params;

  // Last Line of Defense: เผื่อกรณีที่หลุดมาจาก middleware
  if (!isSupportedLocale(lang) || !isSupportedMode(mode)) {
    notFound();
  }

  const settings = await ContentService.getSetting({ lang });

  return (
    <div className="min-h-screen">
      <Navbar mode={mode} settings={settings} lang={lang} />
      <main>{children}</main>
      <Footer settings={settings} />
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; mode: SiteMode }>;
}): Promise<Metadata> {
  const { lang, mode } = await params;
  const settings = await ContentService.getSetting({ lang });

  return buildMetadata({
    lang,
    mode,
    pathname: `/${lang}/${mode}`,
    fallbackTitle: settings?.siteTitle || '56KonFilm',
    fallbackSeo: settings?.seo,
    siteTitle: settings?.siteTitle,
  });
}

export async function generateStaticParams() {
  const paths = [
    { lang: 'en', mode: 'production' },
    { lang: 'en', mode: 'wedding' },
    { lang: 'th', mode: 'production' },
    { lang: 'th', mode: 'wedding' },
  ];
  return paths;
}
