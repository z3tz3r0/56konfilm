// --- Supported Langs & Modes ---
const SUPPORTED_LOCALES = ['th', 'en'] as const;
const SUPPORTED_SITE_MODES = ['production', 'wedding'] as const;

// --- Default Lang & Mode ---
const DEFAULT_LOCALE: Locale = 'en';
const DEFAULT_MODE: SiteMode = 'production';

// Map mode -> theme
const MODE_TO_THEME: Record<SiteMode, 'dark' | 'light'> = {
  production: 'dark',
  wedding: 'light',
};

// Types
type Locale = (typeof SUPPORTED_LOCALES)[number];
type SiteMode = (typeof SUPPORTED_SITE_MODES)[number];

// Exports
export {
  SUPPORTED_LOCALES,
  SUPPORTED_SITE_MODES,
  DEFAULT_LOCALE,
  DEFAULT_MODE,
  MODE_TO_THEME,
};
export type { Locale, SiteMode };
