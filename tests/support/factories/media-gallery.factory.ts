import { MediaGallerySectionBlock } from '@/types/sanity';
import { faker } from '@faker-js/faker';

// TODO: Update src/types/sanity.ts to include these fields during implementation
// This defines the EXPECTED structure for the dev to implement.
export interface MockHybridMediaItem {
  _key: string;
  mediaType: 'image' | 'video';
  image?: any;
  videoFile?: {
    asset: {
      url: string;
      playbackId?: string;
    };
  };
  alt?: string;
}

export const createMediaGalleryBlock = (overrides: Partial<MediaGallerySectionBlock> = {}): MediaGallerySectionBlock => {
  return {
    _type: 'mediaGallerySection',
    _key: faker.string.uuid(),
    heading: {
      heading: faker.lorem.words(3),
      body: faker.lorem.sentence(),
    },
    // @ts-ignore - Intentionally mocking future structure
    items: Array.from({ length: 4 }).map(() => ({
      _key: faker.string.uuid(),
      mediaType: faker.helpers.arrayElement(['image', 'video']),
      image: {
        asset: {
          _ref: `image-${faker.string.uuid()}-1000x1000-jpg`,
          _type: 'reference',
        },
      },
      videoFile: {
        asset: {
          url: 'https://cdn.sanity.io/files/project/dataset/video.mp4',
        },
      },
      alt: faker.lorem.words(2),
    })),
    ...overrides,
  };
};
