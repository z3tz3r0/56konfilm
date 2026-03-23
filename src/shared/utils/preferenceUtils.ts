import {
  Locale,
  SiteMode,
  SUPPORTED_LOCALES,
  SUPPORTED_SITE_MODES,
} from '@shared/config';

const isSupportedLocale = (value: string): value is Locale =>
  SUPPORTED_LOCALES.includes(value as Locale);

const isSupportedMode = (value: string): value is SiteMode =>
  SUPPORTED_SITE_MODES.includes(value as SiteMode);

export { isSupportedLocale, isSupportedMode };
