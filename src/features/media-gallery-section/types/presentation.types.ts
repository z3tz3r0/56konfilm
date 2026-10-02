import type { Locale, SiteMode } from '@shared/config';
import type { MediaGallerySectionBlock } from './mediaGallery.types';

export interface MediaGalleryPresentationProps {
  block: MediaGallerySectionBlock;
  lang: Locale;
  mode: SiteMode;
}
