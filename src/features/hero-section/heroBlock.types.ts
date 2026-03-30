import { BackgroundMediaItem, BaseBlock, ContentCta } from '@shared/types';

export interface HeroSectionBlock extends BaseBlock {
  _type: 'heroSection';
  title?: string;
  tagline?: string;
  parallaxText?: string;
  backgroundMedia?: BackgroundMediaItem[];
  ctas?: ContentCta[];
}
