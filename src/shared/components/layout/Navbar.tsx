import Link from 'next/link';
import { cn } from '@shared/utils';
import { Menu } from 'lucide-react';
import {
  Button,
  LanguageSwitcher,
  ModeSwitcher,
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@shared/components';
import { Locale, SiteMode } from '@shared/config';
import { SiteSettings } from '@shared/types';
import { withContextPrefix } from '@/shared/lib/url/urls';

interface NavbarProps {
  settings: SiteSettings;
  lang: Locale;
  mode: SiteMode;
}

export default async function Navbar({ settings, lang, mode }: NavbarProps) {
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
          <LanguageSwitcher lang={lang} mode={mode} />
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
                    href={withContextPrefix({ href: item.url, lang, mode })}
                    className="hover:text-primary hover:underline"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col items-center gap-8">
                <ModeSwitcher lang={lang} mode={mode} />
                <LanguageSwitcher lang={lang} mode={mode} />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-4">
          <ModeSwitcher lang={lang} mode={mode} />
        </div>

        <div className={`flex flex-1 items-center justify-end gap-x-8 text-sm`}>
          {(mode === 'production'
            ? settings?.productionNav
            : settings?.weddingNav
          )?.map((item) => (
            <Link
              key={item.url}
              href={withContextPrefix({ href: item.url, lang, mode })}
              className={cn('hover:underline', 'text-text-primary')}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
