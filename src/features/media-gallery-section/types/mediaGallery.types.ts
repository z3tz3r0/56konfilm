import { BaseBlock, ContentCta, MediaItem } from '@shared/types';

export interface MediaGallerySectionBlock extends BaseBlock {
  _type: 'mediaGallerySection';
  background?: string;
  sourceType?: 'manual' | 'projects';
  heading: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    align?: string;
  };
  items?: Array<{
    _key?: string;
    mediaType?: 'image' | 'video';
    media?: MediaItem;
    videoUrl?: string;
    label?: string;
    projectSlug?: string;
    projectOverview?: string;
  }>;
  cta?: ContentCta;
}
