import Link from 'next/link';

import { SiteSettings } from '@/types/siteSettings';
import { ModeSwitcher } from './ModeSwitcher';

interface NavbarProps {
  mode: 'production' | 'wedding';
  settings: SiteSettings;
}

const Navbar = async ({ mode, settings }: NavbarProps) => {
  return (
    <header className="fixed w-screen bg-white/5">
      <nav className="container mx-auto grid grid-cols-3 items-center justify-between py-8">
        <Link href="/" className="text-xl font-bold">
          {settings?.siteTitle || '56KonFilm'}
        </Link>

        <ModeSwitcher initialMode={mode} />

        <div className="flex gap-4">
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
