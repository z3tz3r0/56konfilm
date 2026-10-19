/** Resolve fixture avatars locally without loading Sanity configuration or assets. */
export function getImageUrl() {
  return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
}
export const THUMBNAIL_IMAGE = { width: 48 };
export function urlFor(): never {
  throw new Error(
    'The Testimonial fixture must not request CMS background media.'
  );
}
