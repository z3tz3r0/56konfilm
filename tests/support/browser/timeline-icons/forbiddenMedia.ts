/** Fail loudly if icon rendering accidentally returns to CMS image integration. */
export function getImageUrl(): never {
  throw new Error('The Timeline fixture must not resolve legacy image URLs.');
}
/** Reject Sanity media requests so the fixture cannot silently use legacy images. */
export function urlFor(): never {
  throw new Error('The Timeline fixture must not request Sanity media.');
}
