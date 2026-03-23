import { SanityImageSource } from '@sanity/image-url';
import { BaseBlock, ContentCta } from '@shared/types';

export interface TimelineSectionBlock extends BaseBlock {
  _type: 'timelineSection';
  background?: string;
  heading: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    align?: string;
  };
  steps?: Array<{
    _key?: string;
    order?: number;
    title?: string;
    description?: string;
    icon?: SanityImageSource;
  }>;
  cta?: ContentCta;
}
