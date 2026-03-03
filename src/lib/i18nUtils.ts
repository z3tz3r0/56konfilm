import { cookies, headers } from 'next/headers';

import {
  type Locale,
  type SiteMode,
  isSupportedLocale,
  isSupportedMode,
} from '@/lib/preferences';

const FALLBACK_LOCALE: Locale = 'th';
const DEFAULT_MODE: SiteMode = 'production';

type PreferenceSelectionInput = {
  queryLocale?: string | null;
  queryMode?: string | null;
  cookieLocale?: string | null;
  cookieMode?: string | null;
  acceptLanguage?: string | null;
};

type LocaleSelectionResult = {
  locale: Locale;
  shouldPersistLocale: boolean;
};

type ModeSelectionResult = {
  mode: SiteMode;
  shouldPersistMode: boolean;
};

type PreferenceSelectionResult = LocaleSelectionResult & ModeSelectionResult;

/**
 * เลือก locale และ mode ให้เรียบร้อยในครั้งเดียว (จาก query, cookie และ header)
 */
export function selectPreferences({
  queryLocale,
  queryMode,
  cookieLocale,
  cookieMode,
  acceptLanguage,
}: PreferenceSelectionInput): PreferenceSelectionResult {
  const localeResult = deriveLocale({
    queryLocale,
    cookieLocale,
    acceptLanguage,
  });
  const modeResult = deriveMode({ queryMode, cookieMode });
  return { ...localeResult, ...modeResult };
}

/**
 * ใช้ใน Server Component เพื่อดึง locale/mode ปัจจุบันพร้อมสถานะว่าควรเซ็ตคุกกี้หรือไม่
 */
export async function resolvePreferences(): Promise<PreferenceSelectionResult> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);

  return selectPreferences({
    cookieLocale: cookieStore.get('lang')?.value ?? null,
    cookieMode: cookieStore.get('mode')?.value ?? null,
    acceptLanguage: headerList.get('accept-language'),
  });
}

/**
 * ดึง locale เดียวจาก `resolvePreferences`
 */
export async function resolveLocale(): Promise<Locale> {
  const { locale } = await resolvePreferences();
  return locale;
}

/**
 * ดึง mode เดียวจาก `resolvePreferences`
 */
export async function resolveMode(): Promise<SiteMode> {
  const { mode } = await resolvePreferences();
  return mode;
}

function deriveLocale({
  queryLocale,
  cookieLocale,
  acceptLanguage,
}: Pick<
  PreferenceSelectionInput,
  'queryLocale' | 'cookieLocale' | 'acceptLanguage'
>): LocaleSelectionResult {
  if (queryLocale && isSupportedLocale(queryLocale)) {
    return { locale: queryLocale, shouldPersistLocale: true };
  }

  if (cookieLocale && isSupportedLocale(cookieLocale)) {
    return { locale: cookieLocale, shouldPersistLocale: false };
  }

  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map((langPart) => {
      const [locale] = langPart.trim().split(';');
      return locale.split('-')[0];
    });

    const matched = languages.find((lang) => isSupportedLocale(lang));
    if (matched) {
      return { locale: matched as Locale, shouldPersistLocale: true };
    }
  }

  return { locale: FALLBACK_LOCALE, shouldPersistLocale: true };
}

function deriveMode({
  queryMode,
  cookieMode,
}: Pick<
  PreferenceSelectionInput,
  'queryMode' | 'cookieMode'
>): ModeSelectionResult {
  if (queryMode && isSupportedMode(queryMode)) {
    return { mode: queryMode, shouldPersistMode: true };
  }

  if (cookieMode && isSupportedMode(cookieMode)) {
    return { mode: cookieMode, shouldPersistMode: false };
  }

  return { mode: DEFAULT_MODE, shouldPersistMode: true };
}
