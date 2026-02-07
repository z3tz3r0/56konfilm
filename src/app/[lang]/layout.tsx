import { GlobalTransition } from '@/components/layout/GlobalTransition';
import { ModeProvider } from '@/components/providers/ModeProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { SiteMode, isSupportedMode } from '@/lib/preferences';
import { buildMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope, Noto_Sans_Thai, Sora } from 'next/font/google';
import { cookies } from 'next/headers';
import { Toaster } from 'sonner';
import '../globals.css';

// Sora supports Latin + Thai through fallback to system fonts
// For full Thai support, tailwind.config uses font-sans with Thai-capable system stack
const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin', 'latin-ext'],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant-garamond',
  subsets: ['latin', 'latin-ext'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin', 'latin-ext'],
});

const notoSansThai = Noto_Sans_Thai({
  variable: '--font-noto-sans-thai',
  subsets: ['thai'],
});

import { client, settingsQuery } from '@/sanity/lib/queries';

type Props = {
  params: Promise<{ lang: string }>;
};

// Force dynamic rendering to ensure cookies are read on every request
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const settings = await client.fetch(settingsQuery, { lang });

  const metadata = buildMetadata({
    lang,
    pathname: `/${lang}`,
    fallbackTitle: settings?.siteTitle || '56KonFilm',
    fallbackSeo: settings?.seo,
    siteTitle: settings?.siteTitle,
  });

  return {
    ...metadata,
    icons: settings?.favicon ? [{ rel: 'icon', url: settings.favicon }] : undefined,
  };
}

// Map mode to theme for initial server rendering
const MODE_TO_THEME: Record<SiteMode, string> = {
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
  const { lang } = await params;
  const cookieStore = await cookies();
  // Validate cookie value server-side
  const cookieValue = cookieStore.get('mode')?.value;
  const initialMode: SiteMode = isSupportedMode(cookieValue || '') 
    ? (cookieValue as SiteMode) 
    : 'production';
  const initialTheme = MODE_TO_THEME[initialMode];

  return (
    // data-mode helps with CSS selection, data-theme helps next-themes
    <html 
      lang={lang} 
      suppressHydrationWarning 
      data-mode={initialMode} 
      style={{ colorScheme: initialTheme }}
      className={`${sora.variable} ${cormorantGaramond.variable} ${manrope.variable} ${notoSansThai.variable}`}
    >
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme={initialTheme} // FORCE default theme based on server mode
          enableSystem={false} // Disable system preference to enforce mode-based theme
          disableTransitionOnChange
        >
          {/* Synchronize store with server state */}
          <ModeProvider initialMode={initialMode}>
            <GlobalTransition />
            {children}
          </ModeProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
