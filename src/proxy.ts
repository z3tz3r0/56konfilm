import { NextRequest, NextResponse } from 'next/server';

import { selectPreferences } from '@/lib/i18nUtils';

export function proxy(request: NextRequest) {
  const { locale, mode, shouldPersistLocale, shouldPersistMode } =
    selectPreferences({
      queryLocale: request.nextUrl.searchParams.get('lang'),
      queryMode: request.nextUrl.searchParams.get('mode'),
      cookieLocale: request.cookies.get('lang')?.value,
      cookieMode: request.cookies.get('mode')?.value,
      acceptLanguage: request.headers.get('accept-language'),
    });

  const response = NextResponse.next();

  if (shouldPersistLocale || request.cookies.get('lang')?.value !== locale) {
    response.cookies.set({
      name: 'lang',
      value: locale,
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  if (shouldPersistMode || request.cookies.get('mode')?.value !== mode) {
    response.cookies.set({
      name: 'mode',
      value: mode,
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|sanity-cms).*)',
  ],
};
