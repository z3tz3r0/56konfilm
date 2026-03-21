/**
 * Helps prepend the language prefix (lang) to internal URLs.
 */
export function withLang(href: string, lang: string) {
  if (!href) return href;
  // Don't prefix absolute URLs
  if (href.startsWith('http')) return href;
  // Don't prefix if already prefixed
  if (href.startsWith('/en') || href.startsWith('/th')) return href;
  // Handle root
  if (href === '/') return `/${lang}`;
  // Ensure single slash between lang and path
  return `/${lang}${href.startsWith('/') ? '' : '/'}${href}`;
}
