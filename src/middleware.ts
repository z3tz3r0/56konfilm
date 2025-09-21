import { NextRequest, NextResponse } from 'next/server';

import { selectLocale, selectMode } from '@/lib/i18nUtils';

export function middleware(request: NextRequest) {
  const { locale, shouldPersist } = selectLocale({
    queryParam: request.nextUrl.searchParams.get('lang'),
    cookie: request.cookies.get('lang')?.value,
    acceptLanguage: request.headers.get('accept-language'),
  });

  const { mode, shouldPersist: shouldPersistMode } = selectMode({
    queryParam: request.nextUrl.searchParams.get('mode'),
    cookie: request.cookies.get('mode')?.value,
  });

  const response = NextResponse.next();

  if (shouldPersist || request.cookies.get('lang')?.value !== locale) {
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
