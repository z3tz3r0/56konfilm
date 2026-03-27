import { ModeProvider, MotionProvider, ThemeProvider } from '@shared/providers';
import { MODE_TO_THEME } from '@shared/config';
import {
  Anuphan,
  Cormorant_Garamond,
  IBM_Plex_Sans_Thai,
  Manrope,
  Noto_Sans_Thai,
  Sora,
} from 'next/font/google';
import { cookies } from 'next/headers';
import { Toaster } from 'sonner';
import '../globals.css';
import { isSupportedLocale, isSupportedMode } from '@shared/utils';
import Script from 'next/script';
import { env } from '@shared/config';
import { ReactNode } from 'react';

// --- Production Fonts ---
const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});
const notoSansThai = Noto_Sans_Thai({
  variable: '--font-noto-sans-thai',
  subsets: ['thai'],
  display: 'swap',
});

// --- Wedding Fonts
const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant-garamond',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});
const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: '--font-ibm-plex-sans-thai',
  weight: ['400', '500', '600', '700'],
  subsets: ['thai'],
  display: 'swap',
});

// --- Body Fonts ---
const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});
const anuphan = Anuphan({
  variable: '--font-anuphan',
  subsets: ['thai'],
  display: 'swap',
});

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'th' }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const safeLang = isSupportedLocale(lang) ? lang : 'en';

  const cookieStore = await cookies();
  const cookieMode = cookieStore.get('mode')?.value;

  const initialMode =
    cookieMode && isSupportedMode(cookieMode) ? cookieMode : 'production';
  const initialTheme = MODE_TO_THEME[initialMode];

  return (
    <html
      lang={safeLang}
      suppressHydrationWarning
      data-mode={initialMode}
      style={{ colorScheme: initialTheme }}
      className={`${sora.variable} ${cormorantGaramond.variable} ${manrope.variable} ${notoSansThai.variable} ${ibmPlexSansThai.variable} ${anuphan.variable} antialiased`}
    >
      <head>
        {env.NODE_ENV === 'development' && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
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
