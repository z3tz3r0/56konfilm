import type { Locale, SiteMode } from '@shared/config';
import type { MediaGallerySectionBlock } from '../types';

export interface MediaGalleryPresentationProps {
  block: MediaGallerySectionBlock;
  lang: Locale;
  mode: SiteMode;
}
