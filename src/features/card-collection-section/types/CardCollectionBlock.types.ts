import { SanityImageSource } from '@sanity/image-url';
import { BaseBlock, ContentCta } from '@shared/types';

export interface CardCollectionSectionBlock extends BaseBlock {
  _type: 'cardCollectionSection';
  title?: string;
  intro?: string;
  columns?: number;
  background?: string;
  cards?: Array<{
    _key?: string;
    title?: string;
    body?: string;
    icon?: SanityImageSource;
    variant?: string;
    cta?: ContentCta;
  }>;
}
