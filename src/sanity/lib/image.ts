import { env } from '@shared/config';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { ImageSource } from '@shared/types/sanity';

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
});

export const urlFor = (source: ImageSource) => {
  return builder.image(source);
};

interface ImageUrlOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: 'clip' | 'crop' | 'max' | 'fill';
}

export function getImageUrl(
  source: ImageSource,
  options: ImageUrlOptions = {}
): string {
  let img = builder.image(source);
  if (options.width) img = img.width(options.width);
  if (options.height) img = img.height(options.height);
  if (options.quality) img = img.quality(options.quality);
  if (options.fit) img = img.fit(options.fit);
  return img.url();
}

/** Omitted assets are different from malformed sources or builder failures. */
export function getImageSource(
  source: ImageSource | null | undefined,
  options: ImageUrlOptions = {}
): string | { readonly error: true } | undefined {
  if (source === null || source === undefined) {
    return undefined;
  }
  if (
    typeof source === 'object' &&
    'asset' in source &&
    (source.asset === null || source.asset === undefined)
  ) {
    return undefined;
  }
  try {
    return getImageUrl(source, options);
  } catch {
    return { error: true };
  }
}

export const THUMBNAIL_IMAGE = {
  width: 96,
  height: 96,
  fit: 'clip' as const,
} satisfies ImageUrlOptions;
