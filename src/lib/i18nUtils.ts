import { headers, cookies } from 'next/headers';

import { I18nArrayItem } from '@/types/sanity';

const SUPPORTED_LOCALES = ['th', 'en'] as const;
const FALLBACK_LOCALE: Locale = 'th';
const SUPPORTED_MODES = ['production', 'wedding'] as const;
const DEFAULT_MODE: SiteMode = 'production';

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type SiteMode = (typeof SUPPORTED_MODES)[number];

type LocaleSelectionInput = {
  queryParam?: string | null;
  cookie?: string | null;
  acceptLanguage?: string | null;
};

type ModeSelectionInput = {
  queryParam?: string | null;
  cookie?: string | null;
};

/**
 * คืนค่าภาษาเฉพาะจาก internationalized array ตาม locale ที่ใช้งานอยู่
 * @param i18nArray อาร์เรย์ข้อมูลที่มีคีย์ `_key` เป็นรหัสภาษา
 * @param currentLang ภาษาที่ต้องการ (เช่น 'th' หรือ 'en')
 */
export function getLocaleValue<T>(
  i18nArray: I18nArrayItem<T>[] | undefined | null,
  currentLang: string
): T | undefined {
  if (!i18nArray) {
    return undefined;
  }

  const foundValue = i18nArray.find((item) => item._key === currentLang)?.value;
  if (foundValue) {
    return foundValue;
  }

  return i18nArray.find((item) => item._key === FALLBACK_LOCALE)?.value;
}

export async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const headerList = await headers();

  return selectLocale({
    cookie: cookieStore.get('lang')?.value,
    acceptLanguage: headerList.get('accept-language'),
  }).locale;
}

export async function resolveMode(): Promise<SiteMode> {
  const cookieStore = await cookies();
  return selectMode({ cookie: cookieStore.get('mode')?.value }).mode;
}

export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

export function isSupportedMode(mode: string): mode is SiteMode {
  return SUPPORTED_MODES.includes(mode as SiteMode);
}

/**
 * เลือก locale ที่เหมาะสมจาก query, cookie หรือ header
 * @param queryParam ค่าที่ส่งมาจาก query string (?lang=)
 * @param cookie ค่าจากคุกกี้ lang
 * @param acceptLanguage header accept-language ของผู้ใช้
 */
export function selectLocale({
  queryParam,
  cookie,
  acceptLanguage,
}: LocaleSelectionInput): { locale: Locale; shouldPersist: boolean } {
  if (queryParam && isSupportedLocale(queryParam)) {
    return { locale: queryParam, shouldPersist: true };
  }

  if (cookie && isSupportedLocale(cookie)) {
    return { locale: cookie, shouldPersist: false };
  }

  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map((langPart) => {
      const [locale] = langPart.trim().split(';');
      return locale.split('-')[0];
    });

    const matched = languages.find((lang) => isSupportedLocale(lang));
    if (matched) {
      return { locale: matched as Locale, shouldPersist: true };
    }
  }

  return { locale: FALLBACK_LOCALE, shouldPersist: true };
}

/**
 * เลือกโหมดของเว็บไซต์จาก query หรือ cookie
 * @param queryParam ค่าที่ส่งมาจาก query string (?mode=)
 * @param cookie ค่าจากคุกกี้ mode
 */
export function selectMode({
  queryParam,
  cookie,
}: ModeSelectionInput): { mode: SiteMode; shouldPersist: boolean } {
  if (queryParam && isSupportedMode(queryParam)) {
    return { mode: queryParam, shouldPersist: true };
  }

  if (cookie && isSupportedMode(cookie)) {
    return { mode: cookie, shouldPersist: false };
  }

  return { mode: DEFAULT_MODE, shouldPersist: true };
}
