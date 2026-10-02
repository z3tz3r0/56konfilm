import {
  BaseBlock,
  ContentCta,
  MediaItem,
  SectionHeading,
} from '@shared/types';

export interface MediaGallerySectionBlock extends BaseBlock {
  _type: 'mediaGallerySection';
  background?: string;
  sourceType?: 'manual' | 'projects';
  sectionVariant?: 'grid' | 'collage';
  collageImages?: {
    smallPortrait?: MediaItem;
    landscape?: MediaItem;
    largePortrait?: MediaItem;
  };
  heading: SectionHeading;
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
