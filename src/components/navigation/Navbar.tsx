import Link from 'next/link';

import { cn } from '@/lib/utils';
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

type Mode = 'production' | 'wedding';

interface NavbarProps {
  mode: Mode;
  settings: SiteSettings;
  homeSlugs: Record<Mode, string | null>;
}

const Navbar = async ({ mode, settings, homeSlugs }: NavbarProps) => {
  return (
    <header className="fixed z-50 w-screen bg-white/5">
      <nav className="container mx-auto grid max-w-7xl grid-cols-2 items-center justify-between px-4 py-8 md:grid-cols-3">
        <Link href="/" className={cn('text-xl font-bold', 'text-off-white')}>
          {settings?.siteTitle || '56KonFilm'}
        </Link>

        <Sheet>
          <SheetTrigger asChild className="justify-self-end md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={
                mode === 'production' ? '' : 'text-secondary hover:text-primary'
              }
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-secondary text-text-secondary w-full sm:max-w-full">
            <SheetHeader className="hidden">
              <SheetTitle>{''}</SheetTitle>
            </SheetHeader>

            <div className="flex h-screen flex-col items-center justify-center gap-16 text-4xl font-bold">
              <nav className="-mt-16 flex flex-col items-center gap-8">
                <Link href="/" className="hover:text-primary hover:underline">
                  Home
                </Link>
                {(mode === 'production'
                  ? settings?.productionNav
                  : settings?.weddingNav
                )?.map((item) => (
                  <Link
                    key={item.url}
                    href={item.url.startsWith('/') ? item.url : `/${item.url}`}
                    className="hover:text-primary hover:underline"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <ModeSwitcher initialMode={mode} homeSlugs={homeSlugs} />
            </div>
          </SheetContent>
        </Sheet>

        <div className="col-span-2 hidden md:grid md:grid-cols-subgrid">
          <ModeSwitcher initialMode={mode} homeSlugs={homeSlugs} />

          <div className="col-start-2 flex items-center justify-between">
            {(mode === 'production'
              ? settings?.productionNav
              : settings?.weddingNav
            )?.map((item) => (
              <Link
                key={item.url}
                href={item.url.startsWith('/') ? item.url : `/${item.url}`}
                className={cn('hover:underline', 'text-off-white')}
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
