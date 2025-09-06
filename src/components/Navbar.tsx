import { client } from '@/sanity/lib/client'; // ปรับ path ตามโครงสร้างของคุณ
import { settingsQuery } from '@/sanity/lib/queries'; // สร้างไฟล์นี้ตาม Blueprint
import Link from 'next/link';
import { ModeSwitcher } from './ModeSwitcher';

// Interface สำหรับข้อมูล Navigation ที่ดึงมา
interface NavItem {
  label: string;
  url: string;
}

interface Settings {
  siteTitle: string;
  mainNav: NavItem[];
}

// Navbar กลายเป็น Async Server Component
const Navbar = async ({ locale }: { locale: string }) => {
  // ดึงข้อมูล Global Settings จาก Sanity
  const settings = await client.fetch<Settings>(
    settingsQuery,
    { lang: locale },
    // ตั้งค่า revalidation เพื่อให้ข้อมูลอัปเดตเป็นระยะ
    { next: { revalidate: 3600 } } // 1 ช.ม.
  );

  return (
    <header>
      <nav className="flex items-center justify-between gap-8 py-8">
        <Link href={`/${locale}`} className="text-xl font-bold">
          {settings?.siteTitle || '56KonFilm'}
        </Link>

        <ModeSwitcher />

        <div className="flex gap-8">
          {settings?.mainNav?.map((item) => (
            <Link key={item.url} href={`/${locale}${item.url}`}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
