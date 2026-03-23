import { Locale, SiteMode } from '@shared/config';

/**
 * Helps prepend the language prefix (lang) to internal URLs.
 */
interface withContextPrefixParams {
  href: string;
  lang: Locale;
  mode: SiteMode;
}

export function withContextPrefix({
  href,
  lang,
  mode,
}: withContextPrefixParams) {
  const prefix = `/${lang}/${mode}`;

  if (!href) return href;
  // Don't prefix absolute URLs
  if (href.startsWith('http')) return href;
  // Don't prefix if already prefixed
  if (href.startsWith(prefix)) return href;
  // Handle root
  if (href === '/') return `/${lang}/${mode}`;
  // Ensure single slash between lang and path
  return `/${lang}/${mode}/${href.startsWith('/') ? '' : '/'}${href}`;
}
