export function packageGroupParameter(sectionKey: string) {
  return `package-group-${sectionKey}`;
}

/** Updates one section while retaining the pathname, other queries, and hash. */
export function packageGroupUrl(
  href: string,
  sectionKey: string,
  slug?: string | null
) {
  const url = new URL(href);
  const parameter = packageGroupParameter(sectionKey);
  // Remove only this section's previous parameter when writing the new URL.
  url.searchParams.delete(`packageGroup_${sectionKey}`);
  if (slug) url.searchParams.set(parameter, slug);
  else url.searchParams.delete(parameter);
  return `${url.pathname}${url.search}${url.hash}`;
}
