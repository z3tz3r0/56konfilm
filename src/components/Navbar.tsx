import { cookies } from 'next/headers';
import Link from 'next/link';

import { client } from '@/sanity/lib/client';
import { settingsQuery } from '@/sanity/lib/queries';
import { ModeSwitcher } from './ModeSwitcher';

// Interface สำหรับข้อมูล Navigation ที่ดึงมา
interface NavItem {
  label: string;
  url: string;
}

interface Settings {
  siteTitle: string;
  productionNav: NavItem[];
  weddingNav: NavItem[];
  companyTitle: string;
  address: string;
  contactTitle: string;
  contacts: string;
  socialMediaTitle: string;
  socialLinks: NavItem[];
}

const Navbar = async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('lang')?.value ?? 'th';
  const mode =
    cookieStore.get('mode')?.value === 'production' ? 'production' : 'wedding';

  // ดึงข้อมูล Global Settings จาก Sanity
  const settings = await client.fetch<Settings>(
    settingsQuery,
    { lang: locale },
    // ตั้งค่า revalidation เพื่อให้ข้อมูลอัปเดตเป็นระยะ
    { next: { revalidate: 3600 } } // 1 ช.ม.
  );

  return (
    <header className="fixed w-screen bg-white/5">
      <nav className="container mx-auto grid grid-cols-3 items-center justify-between py-8">
        <Link href="/" className="text-xl font-bold">
          {settings?.siteTitle || '56KonFilm'}
        </Link>

        <ModeSwitcher initialMode={mode} />

        <div className="flex gap-8">
          {(mode === 'production'
            ? settings?.productionNav
            : settings?.weddingNav
          )?.map((item) => (
            <Link
              key={item.url}
              href={item.url.startsWith('/') ? item.url : `/${item.url}`}
              className="hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
