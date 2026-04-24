import { BaseBlock, ContentCta, ImageSource } from '@shared/types';

export interface CardCollectionSectionBlock extends BaseBlock {
  _type: 'cardCollectionSection';
  layoutVariant?: 'standard' | 'highlight-intro';
  title?: string;
  intro?: string;
  ctaButton?: ContentCta;
  columns?: number;
  background?: string;
  hasIcon?: boolean;
  cards?: CardItem[];
}

type CardItem = {
  _key?: string;
  title?: string;
  body?: string;
  icon?: { name: string };
  bgImage?: ImageSource;
};
