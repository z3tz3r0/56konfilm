import { BaseBlock, MediaItem } from '@shared/types';

export interface LogoGridSectionBlock extends BaseBlock {
  _type: 'logoGridSection';
  background?: string;
  title?: string;
  logos?: MediaItem[];
}
