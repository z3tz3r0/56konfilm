'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const router = useRouter();

  // Current paths SHOULD be /en/... or /th/... via proxy redirect.
  // If we are somehow on root (e.g. before hydration redirect completes?), default to 'en'.
  const currentLang = ['en', 'th'].includes(segments[0]) ? segments[0] : 'en';

  const getPathFor = (targetLang: string) => {
    if (['en', 'th'].includes(segments[0])) {
      // Replace existing locale
      const remaining = segments.slice(1).join('/');
      // If remaining is empty, it means we are at /en or /th root
      return `/${targetLang}${remaining ? `/${remaining}` : ''}`;
    }
    // Prepend locale if missing (fallback)
    return `/${targetLang}${pathname === '/' ? '' : pathname}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        defaultValue={currentLang}
        onValueChange={(value) => {
          router.push(getPathFor(value));
        }}
      >
        <SelectTrigger>
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
      {/* <Link
        href={getPathFor('en')}
        data-testid="language-switcher-en"
        className={`text-xs tracking-wide transition-opacity ${currentLang === 'en' ? 'font-medium opacity-100' : 'opacity-50 hover:opacity-100'}`}
      >
        EN
      </Link>
      <span>/</span>
      <Link
        href={getPathFor('th')}
        data-testid="language-switcher-th"
        className={`text-xs tracking-wide transition-opacity ${currentLang === 'th' ? 'font-medium opacity-100' : 'opacity-50 hover:opacity-100'}`}
      >
        TH
      </Link> */}
    </div>
  );
}
