import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, SUPPORTED_SITE_MODES } from '@shared/config';
import { derivePreferences } from '@shared/lib/i18n';
import { isSupportedLocale, isSupportedMode } from '@shared/utils';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1) ข้ามไฟล์ระบบและหลังบ้าน ---
  // เช็กซ้ำอีกครั้งเพื่อความปลอดภัยสูงสุด (Double Check)
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.startsWith('/sanity-cms') ||
    pathname.startsWith('/assets') ||
    ['/favicon.ico', '/icon', '/robots.txt', '/sitemap.xml'].includes(
      pathname
    ) ||
    pathname.startsWith('/icon')
  ) {
    return NextResponse.next();
  }

  // --- 2) เช็กโครงสร้าง /[lang]/[mode] ---
  const pathSegments = pathname.split('/').filter(Boolean);
  const urlLang = SUPPORTED_LOCALES.find((lang) => lang === pathSegments[0]);
  const urlMode = SUPPORTED_SITE_MODES.find((mode) => mode === pathSegments[1]);

  // --- 2.1) ถ้า Path มีครบทั้ง /[lang]/[mode] แล้ว
  // ปล. สลับ logic ใช้ URL เป็น Single Source of truth
  // เพื่อลดเวลาในการคำนวณของ middlewares
  if (urlLang && urlMode) {
    const response = NextResponse.next();

    // Sync คุกกี้ให้ตรงกับ Path (Path is Truth)
    if (request.cookies.get('lang')?.value !== urlLang) {
      response.cookies.set('lang', urlLang, { path: '/', maxAge: 31536000 });
    }
    if (request.cookies.get('mode')?.value !== urlMode) {
      response.cookies.set('mode', urlMode, { path: '/', maxAge: 31536000 });
    }

    return response;
  }

  // --- 2.2) ถ้า Path ไม่ครบ (เช่นเข้า / หรือ /th หรือ /production) ---
  // ให้ตัดสินใจเลือก Locale/Mode ที่เหมาะสมที่สุด
  const { locale: targetLocale, mode: targetMode } = derivePreferences({
    urlLocale: urlLang || request.nextUrl.searchParams.get('lang'),
    urlMode: urlMode || request.nextUrl.searchParams.get('mode'),
    cookieLocale: request.cookies.get('lang')?.value,
    cookieMode: request.cookies.get('mode')?.value,
    acceptLanguage: request.headers.get('accept-language'),
  });

  // --- 3) สร้าง URL ใหม่ในรูปแบบ /[targetLocale]/[targetMode]/[...ส่วนที่เหลือ] ---
  // โดยเราจะเอาส่วนที่ไม่ใช่ lang หรือ mode (ที่ตรงกับระบบของเรา) เท่านั้น
  // ค่าที่เอา เช่น xyz, ads เป็นต้น
  const remainingSegments = pathSegments.filter((segment) => {
    const isAnyLocale = isSupportedLocale(segment);
    const isAnyMode = isSupportedMode(segment);
    return !isAnyLocale && !isAnyMode;
  });

  const newPathname = `/${targetLocale}/${targetMode}/${remainingSegments.join('/')}`;
  if (newPathname === pathname) return NextResponse.next();

  // ลบ trailing slash ถ้ามี (ยกเว้นหน้า root)
  const cleanPathname =
    newPathname.replace(/\/$/, '') || `/${targetLocale}/${targetMode}`;

  const redirectUrl = new URL(cleanPathname, request.url);
  redirectUrl.search = request.nextUrl.search; // เก็บ Query Params ไว้

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set('lang', targetLocale, { path: '/', maxAge: 31536000 });
  response.cookies.set('mode', targetMode, { path: '/', maxAge: 31536000 });

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|icon|sw.js|sanity-cms|robots.txt|sitemap.xml).*)',
  ],
};
