import { NextRequest, NextResponse } from 'next/server';

import { selectPreferences } from '@/lib/i18nUtils';

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Skip public files and API routes (already handled by matcher, but good safety)
  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.startsWith('/sanity-cms')
  ) {
    return NextResponse.next();
  }

  // 2. Check for locale in path
  const pathnameIsMissingLocale = (['en', 'th'] as const).every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // 3. Resolve preferences
  // We pass 'null' for queryLocale because we are now path-based, 
  // but if we wanted to support ?lang= override, we could keep it.
  const { locale, mode, shouldPersistLocale, shouldPersistMode } =
    selectPreferences({
      queryLocale: request.nextUrl.searchParams.get('lang'),
      queryMode: request.nextUrl.searchParams.get('mode'),
      cookieLocale: request.cookies.get('lang')?.value,
      cookieMode: request.cookies.get('mode')?.value,
      acceptLanguage: request.headers.get('accept-language'),
    });

  // 4. Redirect if locale is missing in path
  if (pathnameIsMissingLocale) {
    const newUrl = new URL(
      `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
      request.url
    );
    // Preserve query params
    newUrl.search = request.nextUrl.search;
    
    const response = NextResponse.redirect(newUrl);

    // Set cookies on redirect if needed
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

  // 5. If locale matches path, we can still update cookies if they drift
  // (e.g. user manually navigated to /th but cookie was en)
  // Extract locale from path
  const pathLocale = (['en', 'th'] as const).find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  const response = NextResponse.next();

  // If path has a valid locale, sync cookie to THAT locale (Path is Truth)
  if (pathLocale && request.cookies.get('lang')?.value !== pathLocale) {
     response.cookies.set({
      name: 'lang',
      value: pathLocale,
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  } else if (!pathLocale && (shouldPersistLocale || request.cookies.get('lang')?.value !== locale)) {
    // If no path locale (should cause redirect above, but fallback), sync preference
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
    // Skip all internal paths (_next), API, assets, favicon, sanity-cms
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|sanity-cms).*)',
  ],
};
