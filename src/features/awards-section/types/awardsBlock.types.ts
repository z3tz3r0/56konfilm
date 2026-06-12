import { BaseBlock, SectionHeading } from '@shared/types';
import { ImageSource } from '@shared/types';

export interface AwardsSectionBlock extends BaseBlock {
  _type: 'awardsSection';
  background?: string;
  heading?: SectionHeading;
  awards?: Array<{
    _key?: string;
    name?: string;
    event?: string;
    year?: string;
    logo?: ImageSource;
  }>;
}
