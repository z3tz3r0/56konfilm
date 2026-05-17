import { BaseBlock, SectionHeading } from '@shared/types';
import { SanityImageSource } from '@sanity/image-url';

export interface TeamSectionBlock extends BaseBlock {
  _type: 'teamSection';
  background?: string;
  heading?: SectionHeading;
  members?: Array<{
    _key?: string;
    name?: string;
    role?: string;
    bio?: string;
    image?: SanityImageSource;
  }>;
}
