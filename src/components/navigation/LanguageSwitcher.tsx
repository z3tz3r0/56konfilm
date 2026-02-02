'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  
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
      <Link 
        href={getPathFor('en')} 
        data-testid="language-switcher-en"
        className={`text-sm tracking-wide transition-opacity ${currentLang === 'en' ? 'opacity-100 font-medium' : 'opacity-50 hover:opacity-100'}`}
      >
        EN
      </Link>
      <span className="text-secondary/30">/</span>
      <Link 
        href={getPathFor('th')} 
        data-testid="language-switcher-th"
        className={`text-sm tracking-wide transition-opacity ${currentLang === 'th' ? 'opacity-100 font-medium' : 'opacity-50 hover:opacity-100'}`}
      >
        TH
      </Link>
    </div>
  );
}
