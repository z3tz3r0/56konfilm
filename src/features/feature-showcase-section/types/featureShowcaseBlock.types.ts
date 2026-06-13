import { BaseBlock, SectionHeading, ImageSource } from '@shared/types';

export interface FeatureShowcaseSectionBlock extends BaseBlock {
  _type: 'featureShowcaseSection';
  background?: string;
  layout?: 'accordion' | 'grid';
  heading?: SectionHeading;
  features?: Array<{
    _key?: string;
    title?: string;
    description?: string;
    icon?: string;
    image?: ImageSource;
  }>;
}
