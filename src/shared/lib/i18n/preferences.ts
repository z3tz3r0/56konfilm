import { isSupportedLocale, isSupportedMode } from '@shared/utils';
import { DEFAULT_LOCALE, DEFAULT_MODE, Locale, SiteMode } from '@shared/config';

interface DerivePreferencesParams {
  urlLocale?: string | null;
  urlMode?: string | null;
  cookieLocale?: string | null;
  cookieMode?: string | null;
  acceptLanguage?: string | null;
}

interface PreferenceResult {
  locale: Locale;
  mode: SiteMode;
  shouldUpdateCookie: boolean;
}

/**
 * หัวใจหลัก: ตัดสินใจเลือก Preference จากทิศทางดังต่อไปนี้
 * ยึดหลัก: URL > Cookie > Browser Header > Default
 */
function derivePreferences({
  urlLocale,
  urlMode,
  cookieLocale,
  cookieMode,
  acceptLanguage,
}: DerivePreferencesParams): PreferenceResult {
  const locale =
    urlLocale && isSupportedLocale(urlLocale)
      ? urlLocale
      : cookieLocale && isSupportedLocale(cookieLocale)
        ? cookieLocale
        : matchBrowserLocale(acceptLanguage) || DEFAULT_LOCALE;

  const mode =
    urlMode && isSupportedMode(urlMode)
      ? urlMode
      : cookieMode && isSupportedMode(cookieMode)
        ? cookieMode
        : DEFAULT_MODE;

  const shouldUpdateCookie =
    urlLocale !== cookieLocale || urlMode !== cookieMode;

  return { locale, mode, shouldUpdateCookie };
}

/**
 * Helper สำหรับแกะภาษาจาก Header
 */
function matchBrowserLocale(acceptLanguage?: string | null): Locale | null {
  if (!acceptLanguage) return null;
  const languages = acceptLanguage
    .split(',')
    .map((language) => language.trim().split(';')[0].split('-')[0]);
  return languages.find((language) => isSupportedLocale(language)) || null;
}

export { derivePreferences };
