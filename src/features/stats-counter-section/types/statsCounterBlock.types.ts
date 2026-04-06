import { BaseBlock, SectionHeading } from '@shared/types';

export interface StatsCounterSectionBlock extends BaseBlock {
  _type: 'statsCounterSection';
  background?: string;
  heading?: SectionHeading;
  stats?: Array<{
    _key?: string;
    value?: string;
    suffix?: string;
    label?: string;
  }>;
}
