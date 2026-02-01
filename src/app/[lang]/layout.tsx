import { GlobalTransition } from '@/components/layout/GlobalTransition';
import { ModeProvider } from '@/components/providers/ModeProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { SiteMode, isSupportedMode } from '@/lib/preferences';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope, Noto_Sans_Thai, Sora } from 'next/font/google';
import { cookies } from 'next/headers';
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

const metadataBase =
  process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : process.env.VERCEL_URL
      ? new URL(`https://${process.env.VERCEL_URL}`)
      : new URL('http://localhost:3000');

import { client, settingsQuery } from '@/sanity/lib/queries';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const settings = await client.fetch(settingsQuery, { lang });
  
  return {
    metadataBase,
    title: {
      default: settings?.siteTitle || '56KonFilm',
      template: `%s | ${settings?.siteTitle || '56KonFilm'}`,
    },
    description: 'Film Production House',
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
    <html lang={lang} suppressHydrationWarning data-mode={initialMode} style={{ colorScheme: initialTheme }}>
      <body
        className={`${sora.variable} ${cormorantGaramond.variable} ${manrope.variable} ${notoSansThai.variable} font-body antialiased`}
      >
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
      </body>
    </html>
  );
}
