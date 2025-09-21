import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navigation/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { resolvePreferences } from '@/lib/i18nUtils';
import { client } from '@/sanity/lib/client';
import { settingsQuery } from '@/sanity/lib/queries';
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
  const settings = await client.fetch<SiteSettings>(
    settingsQuery,
    { lang: locale },
    // ตั้งค่า revalidation เพื่อให้ข้อมูลอัปเดตเป็นระยะ
    { next: { revalidate: 3600 } } // 1 ช.ม.
  );
  // console.log('🚀 ~ SiteLayout ~ mode:', mode);
  // console.log('🚀 ~ SiteLayout ~ settings:', settings);

  return (
    <div className="min-h-screen">
      <Navbar mode={mode} settings={settings} />
      <main>{children}</main>
      <Toaster />
      <Footer settings={settings} />
    </div>
  );
}
