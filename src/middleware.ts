import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'th'];
const defaultLocale = 'en';

async function getLocaleFromHeaders(): Promise<string> {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  if (!acceptLanguage) {
    return defaultLocale;
  }

  // accept-language header อาจมีได้หลายค่า เช่น "en-US,en;q=0.9,th;q=0.8"
  const languages = acceptLanguage.split(',').map((lang) => {
    const [locale] = lang.trim().split(';');
    return locale.split('-')[0];
  });

  // หาภาษาแรกที่ตรงกับที่เรา support
  return languages.find((lang) => locales.includes(lang)) || defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return;
  }

  const locale = getLocaleFromHeaders();
  request.nextUrl.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|sanity-cms).*)',
  ],
};
