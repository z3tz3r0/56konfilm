import { env } from '@shared/config';
import { createImageUrlBuilder, SanityImageSource } from '@sanity/image-url';

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
});

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};

interface ImageUrlOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: 'clip' | 'crop' | 'max' | 'fill';
}

export function getImageUrl(
  source: SanityImageSource,
  options: ImageUrlOptions = {}
): string {
  let img = builder.image(source);
  if (options.width) img = img.width(options.width);
  if (options.height) img = img.height(options.height);
  if (options.quality) img = img.quality(options.quality);
  if (options.fit) img = img.fit(options.fit);
  return img.url();
}

export const THUMBNAIL_IMAGE = {
  width: 96,
  height: 96,
  fit: 'clip' as const,
} satisfies ImageUrlOptions;
