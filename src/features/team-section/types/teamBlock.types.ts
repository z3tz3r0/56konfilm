import { BaseBlock, SectionHeading } from '@shared/types';
import type { ImageSource } from '@shared/types/sanity';

export interface TeamSectionBlock extends BaseBlock {
  _type: 'teamSection';
  background?: string;
  heading?: SectionHeading;
  members?: Array<{
    _key: string;
    name: string;
    role: string;
    bio?: string;
    image?: ImageSource;
  }>;
}
