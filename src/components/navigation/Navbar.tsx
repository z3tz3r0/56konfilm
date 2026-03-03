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
import { LanguageSwitcher } from './LanguageSwitcher';
import { ModeSwitcher } from './ModeSwitcher';

type Mode = 'production' | 'wedding';

interface NavbarProps {
  mode: Mode;
  settings: SiteSettings;
  homeSlugs: Record<Mode, string | null>;
  lang: 'en' | 'th';
}

const Navbar = async ({ mode, settings, homeSlugs, lang }: NavbarProps) => {
  const withLang = (href: string) => {
    if (href.startsWith('http')) return href;
    if (href.startsWith('/en') || href.startsWith('/th')) return href;
    if (href === '/') return `/${lang}`;
    return `/${lang}${href.startsWith('/') ? '' : '/'}${href}`;
  };

  return (
    <header className="fixed z-50 w-screen bg-white/5 backdrop-blur-md">
      <nav className="flex items-center justify-between gap-16 px-14 py-4">
        <div className="flex flex-1 items-center gap-x-4">
          <Link
            href={`/${lang}`}
            className={cn('text-xl font-bold', 'text-text-primary')}
          >
            {settings?.siteTitle || '56KonFilm'}
          </Link>
          <LanguageSwitcher />
        </div>

        <Sheet>
          <SheetTrigger asChild className="justify-self-end md:hidden">
            <Button
              variant="ghost"
              size="icon"
              data-testid="mobile-menu-button"
              className={
                mode === 'production' ? '' : 'text-secondary hover:text-primary'
              }
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full">
            <SheetHeader>
              <SheetTitle className="hidden">{''}</SheetTitle>
            </SheetHeader>

            <div className="flex h-screen flex-col items-center justify-center gap-16 text-4xl font-bold">
              <nav className="-mt-16 flex flex-col items-center gap-8">
                <Link
                  href={`/${lang}`}
                  className="hover:text-primary hover:underline"
                >
                  Home
                </Link>
                {(mode === 'production'
                  ? settings?.productionNav
                  : settings?.weddingNav
                )?.map((item) => (
                  <Link
                    key={item.url}
                    href={withLang(item.url)}
                    className="hover:text-primary hover:underline"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col items-center gap-8">
                <ModeSwitcher homeSlugs={homeSlugs} lang={lang} />
                <LanguageSwitcher />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-4">
          <ModeSwitcher homeSlugs={homeSlugs} lang={lang} />
        </div>

        <div
          className={`font-primary flex flex-1 items-center justify-end gap-x-8 ${mode === 'production' && 'text-sm'}`}
        >
          {(mode === 'production'
            ? settings?.productionNav
            : settings?.weddingNav
          )?.map((item) => (
            <Link
              key={item.url}
              href={withLang(item.url)}
              className={cn('hover:underline', 'text-text-primary')}
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
