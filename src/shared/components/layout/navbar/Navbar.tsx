import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
  Button,
  LanguageSwitcher,
  ModeSwitcher,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@shared/components';
import { Locale, SiteMode } from '@shared/config';
import { SiteSettings } from '@shared/types';
import { withContextPrefix } from '@shared/lib/url';
import ActiveLink from './ActiveLink';
import NavbarScrollController from './NavbarScrollController';
import { VisuallyHidden } from 'radix-ui';
import { cn } from '@shared/utils';

interface NavbarProps {
  settings: SiteSettings;
  lang: Locale;
  mode: SiteMode;
}

export default async function Navbar({ settings, lang, mode }: NavbarProps) {
  const navItems =
    mode === 'production' ? settings.productionNav : settings.weddingNav;
  const isMoreThanFive = navItems && navItems?.length > 5;

  return (
    <NavbarScrollController>
      <nav className="text-text-secondary flex justify-between px-12 py-4 md:grid md:grid-cols-3 lg:px-14">
        <div className="flex flex-1 items-center gap-x-4">
          <Link
            href={`/${lang}/${mode}`}
            className={'text-text-primary text-xl font-bold'}
          >
            {settings?.siteTitle || '56KonFilm'}
          </Link>
          <div className="invisible hidden md:visible md:block">
            <LanguageSwitcher lang={lang} mode={mode} />
          </div>
        </div>

        <div className="invisible hidden md:visible md:mx-auto md:block">
          <ModeSwitcher lang={lang} mode={mode} />
        </div>

        <div
          className={cn(
            'invisible hidden items-center justify-end gap-x-6 overflow-hidden text-sm',
            !isMoreThanFive && 'xl:visible xl:flex'
          )}
        >
          {navItems?.map((item) => {
            const fullHref = withContextPrefix({ href: item.url, lang, mode });
            return (
              <ActiveLink
                key={fullHref}
                href={fullHref}
                className={'hover:underline'}
                activeClassName="text-text-primary font-semibold"
              >
                {item.label}
              </ActiveLink>
            );
          })}
        </div>

        {/* Mobile — Hamburger menu */}
        <Sheet>
          <SheetTrigger
            asChild
            className={cn(
              'justify-self-end',
              !isMoreThanFive && 'xl:invisible xl:hidden'
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              data-testid="mobile-menu-button"
              className={'text-text-secondary'}
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full">
            <VisuallyHidden.Root asChild>
              <SheetTitle>Navigation menu</SheetTitle>
            </VisuallyHidden.Root>
            <div className="flex h-screen flex-col items-center justify-center gap-16 text-4xl font-bold">
              <nav className="flex flex-col items-center gap-8">
                {navItems?.map((item) => {
                  const fullHref = withContextPrefix({
                    href: item.url,
                    lang,
                    mode,
                  });

                  return (
                    <ActiveLink
                      key={fullHref}
                      href={fullHref}
                      className="text-text-secondary hover:underline"
                      activeClassName="text-primary underline"
                    >
                      {item.label}
                    </ActiveLink>
                  );
                })}
              </nav>
              <div className="flex flex-col items-center gap-8 md:invisible md:hidden">
                <LanguageSwitcher lang={lang} mode={mode} />
                <ModeSwitcher lang={lang} mode={mode} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </NavbarScrollController>
  );
}
