import { BaseBlock, ContentCta, MediaItem } from '@shared/types';

export interface TwoColumnSectionBlock extends BaseBlock {
  _type: 'twoColumnSection';
  layout?: string;
  background?: string;
  content: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    align?: string;
  };
  media?: MediaItem;
  ctas?: ContentCta[];
}
