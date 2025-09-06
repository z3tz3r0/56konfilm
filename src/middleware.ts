import Negotiator from 'negotiator';
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'th'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const headers = {
    'accept-language': request.headers.get('accept-language') || '',
  };
  const languages = new Negotiator({ headers }).languages();

  // หาภาษาที่ตรงกับที่เรา support
  return (
    languages.find((lang) => locales.includes(lang.split('-')[0])) ||
    defaultLocale
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // เช็คว่า path มี locale prefix แล้วหรือยัง (เช่น /en, /th)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return;
  }

  // ถ้าไม่มี ให้ redirect ไปยัง locale ที่เหมาะสม
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;

  // ใช้ NextResponse.redirect
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // ข้าม path ทั้งหมดที่มี dot (เช่น static files)
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|sanity-cms).*)',
  ],
};
