import { BaseBlock, SectionHeading } from '@shared/types';
import { SanityImageSource } from '@sanity/image-url';

export interface VideoShowreelSectionBlock extends BaseBlock {
  _type: 'videoShowreelSection';
  background?: string;
  heading?: SectionHeading;
  videoUrl?: string;
  thumbnail?: SanityImageSource;
  caption?: string;
}
