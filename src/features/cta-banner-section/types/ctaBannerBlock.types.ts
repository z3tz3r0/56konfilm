import { BaseBlock, ContentCta, MediaItem, SanityColor } from '@shared/types';

export interface CtaBannerSectionBlock extends BaseBlock {
  _type: 'ctaBannerSection';
  background?: string;
  layout?: string;
  content: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    align?: string;
  };
  media?: MediaItem;
  ctas?: ContentCta[];
  customColors?: {
    eyebrow?: SanityColor;
    heading?: SanityColor;
    body?: SanityColor;
  };
  overlay?: {
    enabled: boolean;
    color?: SanityColor;
    opacity?: number;
  };
}
