import { BaseBlock, SectionHeading } from '@shared/types';

export interface ProcessSectionBlock extends BaseBlock {
  _type: 'processSection';
  background?: string;
  layout?: 'numbered' | 'timeline';
  heading?: SectionHeading;
  steps?: Array<{
    _key?: string;
    stepNumber?: number;
    title?: string;
    description?: string;
    icon?: string;
  }>;
}
