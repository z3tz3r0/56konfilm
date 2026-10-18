/** Fixture-only URL builder. Never imports application configuration or a CMS client. */
export function urlFor(image: { src: string }) {
  const builder = {
    width: () => builder,
    fit: () => builder,
    url: () => image.src,
  };
  return builder;
}
