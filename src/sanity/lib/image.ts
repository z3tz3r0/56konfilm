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
