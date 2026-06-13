import { BaseBlock, SectionHeading, ImageSource } from '@shared/types';

export interface CapabilitiesSectionBlock extends BaseBlock {
  _type: 'capabilitiesSection';
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
