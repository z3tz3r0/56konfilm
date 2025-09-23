import Link from 'next/link';

import { SiteSettings } from '@/types/siteSettings';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { ModeSwitcher } from './ModeSwitcher';

interface NavbarProps {
  mode: 'production' | 'wedding';
  settings: SiteSettings;
}

const Navbar = async ({ mode, settings }: NavbarProps) => {
  return (
    <header className="fixed z-50 w-screen bg-white/5">
      <nav className="container mx-auto grid grid-cols-2 items-center justify-between py-8 sm:grid-cols-3">
        <Link href="/" className="text-xl font-bold">
          {settings?.siteTitle || '56KonFilm'}
        </Link>

        <Sheet>
          <SheetTrigger asChild className="justify-self-end sm:hidden">
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full">
            <SheetHeader>
              <SheetTitle>{''}</SheetTitle>
            </SheetHeader>
            <ModeSwitcher initialMode={mode} />

            <div className="flex justify-between gap-4">
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
          </SheetContent>
        </Sheet>
        <div className="col-span-2 hidden grid-cols-subgrid sm:block">
          <ModeSwitcher initialMode={mode} className="col-start-2" />

          <div className="col-start-3 flex justify-between gap-4">
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
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
