import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navigation/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { resolvePreferences } from '@/lib/i18nUtils';
import { client } from '@/sanity/lib/client';
import { modeHomeSlugsQuery, settingsQuery } from '@/sanity/lib/queries';
import { SiteSettings } from '@/types/siteSettings';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';

interface SiteLayoutProps {
  children: ReactNode;
}

export default async function SiteLayout({ children }: SiteLayoutProps) {
  const { locale, shouldPersistLocale, mode, shouldPersistMode } =
    await resolvePreferences();

  if (shouldPersistLocale || shouldPersistMode) {
    const cookieStore = await cookies();

    if (shouldPersistLocale) {
      cookieStore.set({
        name: 'lang',
        value: locale,
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    if (shouldPersistMode) {
      cookieStore.set({
        name: 'mode',
        value: mode,
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }
  }

  // ดึงข้อมูล Global Settings จาก Sanity
  const [settings, homeSlugs] = await Promise.all([
    client.fetch<SiteSettings>(
    settingsQuery,
    { lang: locale },
    // ตั้งค่า revalidation เพื่อให้ข้อมูลอัปเดตเป็นระยะ
    { next: { revalidate: 3600 } }
  ),
    client.fetch<{ production?: { slug?: string | null }; wedding?: { slug?: string | null } }>(
      modeHomeSlugsQuery,
      {},
      { next: { revalidate: 3600 } }
    ),
  ]);

  const modeSlugMap = {
    production: homeSlugs.production?.slug ?? null,
    wedding: homeSlugs.wedding?.slug ?? null,
  } as const;

  return (
    <div className="min-h-screen">
      <Navbar mode={mode} settings={settings} homeSlugs={modeSlugMap} />
      <main>{children}</main>
      <Toaster />
      <Footer settings={settings} />
    </div>
  );
}
