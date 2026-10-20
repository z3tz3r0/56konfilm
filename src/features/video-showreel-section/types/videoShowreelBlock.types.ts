import { BaseBlock, SectionHeading } from '@shared/types';
import type { ImageSource } from '@shared/types';

export interface VideoShowreelSectionBlock extends BaseBlock {
  _type: 'videoShowreelSection';
  background?: string;
  heading?: SectionHeading;
  videoUrl?: string;
  thumbnail?: ImageSource;
  caption?: string;
}
