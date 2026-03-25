'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components';
import { isSupportedLocale, isSupportedMode } from '@shared/utils';
import {
  Locale,
  SiteMode,
  SUPPORTED_LOCALES,
  SUPPORTED_SITE_MODES,
} from '@shared/config';
import { usePathname, useRouter } from 'next/navigation';

interface LanguageSwitcherProps {
  lang: Locale;
  mode: SiteMode;
}

export default function LanguageSwitcher({
  lang,
  mode,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const router = useRouter();

  // Current paths SHOULD be /en/... or /th/... via proxy redirect.
  // If we are somehow on root (e.g. before hydration redirect completes?), default to 'en'.
  const isLangSupported = isSupportedLocale(pathSegments[0]);
  const safeLang = isLangSupported ? pathSegments[0] : lang;
  const safeMode = isSupportedMode(pathSegments[1]) ? pathSegments[1] : mode;

  const getPathFor = (targetLocale: string, targetMode: string) => {
    if (isLangSupported) {
      const filteredSegments = pathSegments.filter(
        (part) => !isSupportedLocale(part) && !isSupportedMode(part)
      );
      return `/${targetLocale}/${targetMode}/${filteredSegments.join('/')}`;
    }
    // Prepend locale if missing (fallback)
    return `/${targetLocale}/${targetMode}/${pathname === '/' ? '' : pathname}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        defaultValue={safeLang}
        onValueChange={(value) => {
          router.push(getPathFor(value, safeMode));
        }}
      >
        <SelectTrigger className={''}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectGroup>
            <SelectItem value="en" data-testid="language-switcher-en">
              EN
            </SelectItem>
            <SelectItem value="th" data-testid="language-switcher-th">
              TH
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
