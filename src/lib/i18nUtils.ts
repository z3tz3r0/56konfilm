import { I18nArrayItem } from '@/types/sanity';

const FALLBACK_LOCALE = 'en';

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

  // Fallback to the default language if the current one is not found
  return i18nArray.find((item) => item._key === FALLBACK_LOCALE)?.value;
}
