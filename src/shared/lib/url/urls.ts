import { Locale, SiteMode } from '@shared/config';

/**
 * Helps prepend the language prefix (lang) to internal URLs.
 */
interface ContextPrefixProps {
  href: string | null;
  lang: Locale;
  mode: SiteMode;
}

export function withContextPrefix({ href, lang, mode }: ContextPrefixProps) {
  if (!href) return `/${lang}/${mode}`;

  const cleanHref = href.replace(/^\/+|\/+$/g, '');
  const isHome = cleanHref === 'home' || cleanHref === '';

  if (isHome) return `/${lang}/${mode}`;

  return `/${lang}/${mode}/${cleanHref}`;
}
