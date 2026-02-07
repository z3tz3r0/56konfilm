import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navigation/Navbar';
import { resolvePreferences } from '@/lib/i18nUtils';
import { sanityFetch } from '@/sanity/lib/fetch';
import { modeHomeSlugsQuery, settingsQuery } from '@/sanity/lib/queries';
import { SiteSettings } from '@/types/siteSettings';
import { ReactNode } from 'react';

interface ContactLayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function ContactLayout({ children, params }: ContactLayoutProps) {
  const { lang: rawLang } = await params;
  const lang = rawLang as 'en' | 'th';
  const { mode } = await resolvePreferences();

  // Fetch Global Settings and Home Slugs for Navbar
  const [settings, homeSlugs] = await Promise.all([
    sanityFetch<SiteSettings>({
      query: settingsQuery,
      params: { lang },
      tags: ['settings'],
    }),
    sanityFetch<{ production?: { slug?: string | null }; wedding?: { slug?: string | null } }>({
      query: modeHomeSlugsQuery,
      tags: ['page'],
    }),
  ]);

  const modeSlugMap = {
    production: homeSlugs.production?.slug ?? null,
    wedding: homeSlugs.wedding?.slug ?? null,
  } as const;

  return (
    <div className="min-h-screen">
      <Navbar mode={mode} settings={settings} homeSlugs={modeSlugMap} lang={lang} />
      <main>{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
