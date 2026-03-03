import { ModeProvider } from '@/components/providers/ModeProvider';
import MotionProvider from '@/components/providers/MotionProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { buildMetadata } from '@/lib/metadata';
import { isSupportedMode, type SiteMode } from '@/lib/preferences';
import type { Metadata } from 'next';
import {
  Cormorant_Garamond,
  Manrope,
  Noto_Sans_Thai,
  Sora,
} from 'next/font/google';
import { cookies } from 'next/headers';
import { Toaster } from 'sonner';
import '../globals.css';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant-garamond',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

const notoSansThai = Noto_Sans_Thai({
  variable: '--font-noto-sans-thai',
  subsets: ['thai'],
  display: 'swap',
});

import { sanityFetch } from '@/sanity/lib/fetch';
import { settingsQuery } from '@/sanity/lib/queries';
import { SiteSettings } from '@/types/siteSettings';
import Script from 'next/script';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const settings = await sanityFetch<SiteSettings | null>({
    query: settingsQuery,
    params: { lang },
    tags: ['settings'],
  });

  const metadata = buildMetadata({
    lang,
    pathname: `/${lang}`,
    fallbackTitle: settings?.siteTitle || '56KonFilm',
    fallbackSeo: settings?.seo,
    siteTitle: settings?.siteTitle,
  });

  return {
    ...metadata,
    icons: settings?.favicon
      ? [{ rel: 'icon', url: settings.favicon }]
      : undefined,
  };
}

const MODE_TO_THEME: Record<SiteMode, 'dark' | 'light'> = {
  production: 'dark',
  wedding: 'light',
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'th' }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const [{ lang }, cookieStore] = await Promise.all([params, cookies()]);
  const cookieMode = cookieStore.get('mode')?.value;
  const initialMode: SiteMode =
    cookieMode && isSupportedMode(cookieMode)
      ? (cookieMode as SiteMode)
      : 'production';
  const initialTheme = MODE_TO_THEME[initialMode];

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      data-mode={initialMode}
      style={{ colorScheme: initialTheme }}
      className={`${sora.variable} ${cormorantGaramond.variable} ${manrope.variable} ${notoSansThai.variable} antialiased`}
    >
      <head>
        {process.env.NODE_ENV === 'development' && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="font-body">
        <ThemeProvider
          attribute="class"
          defaultTheme={initialTheme}
          enableSystem={false}
          disableTransitionOnChange
        >
          <ModeProvider initialMode={initialMode}>
            <MotionProvider>{children}</MotionProvider>
          </ModeProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
