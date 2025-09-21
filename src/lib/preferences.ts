export const SUPPORTED_LOCALES = ['th', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const SUPPORTED_SITE_MODES = ['production', 'wedding'] as const;
export type SiteMode = (typeof SUPPORTED_SITE_MODES)[number];

export const isSupportedLocale = (value: string): value is Locale =>
  SUPPORTED_LOCALES.includes(value as Locale);

export const isSupportedMode = (value: string): value is SiteMode =>
  SUPPORTED_SITE_MODES.includes(value as SiteMode);
