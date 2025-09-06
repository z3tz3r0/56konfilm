import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'th'];
const defaultLocale = 'en';

/**
 * ฟังก์ชันนี้จะอ่านค่า 'accept-language' header จาก request ที่เข้ามา
 * เพื่อหารหัสภาษา (locale) ที่เหมาะสมที่สุดสำหรับผู้ใช้
 * @param request - อ็อบเจกต์ NextRequest ที่ได้รับจาก middleware
 * @returns {string} รหัสภาษา เช่น 'en' หรือ 'th'
 */
function getLocale(request: NextRequest): string {
  // ดึงค่า 'accept-language' header จาก request โดยตรง
  // นี่เป็นวิธีมาตรฐานและถูกต้องสำหรับ middleware
  const acceptLanguage = request.headers.get('accept-language');

  if (!acceptLanguage) {
    return defaultLocale;
  }

  // แยกภาษาต่างๆ และจัดลำดับความสำคัญตามที่ browser ส่งมา
  const languages = acceptLanguage.split(',').map((langPart) => {
    const [locale] = langPart.trim().split(';');
    return locale.split('-')[0]; // เอาแค่รหัสภาษาหลัก เช่น 'en' จาก 'en-US'
  });

  // ค้นหาภาษาแรกใน list ที่ browser ต้องการ ซึ่งเว็บไซต์ของเรารองรับ
  return languages.find((lang) => locales.includes(lang)) || defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ตรวจสอบว่า pathname ที่เข้ามา มีรหัสภาษาอยู่แล้วหรือไม่
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // ถ้ามีรหัสภาษาแล้ว ก็ไม่ต้องทำอะไรต่อ
  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // ถ้ายังไม่มีรหัสภาษา ให้เรียกใช้ฟังก์ชันเพื่อหาภาษาที่เหมาะสม
  const locale = getLocale(request);

  // สร้าง URL ใหม่โดยการเติมรหัสภาษาเข้าไปข้างหน้า
  const newUrl = new URL(`/${locale}${pathname}`, request.url);

  // ทำการ redirect ไปยัง URL ใหม่
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // กำหนดให้ middleware ทำงานกับทุก path ยกเว้น path ที่ระบุ
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|sanity-cms).*)',
  ],
};
