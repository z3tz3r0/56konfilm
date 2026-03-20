import { BaseBlock } from '@shared/types';

export interface PhilosophySectionBlock extends BaseBlock {
  _type: 'philosophySection';
  background?: string;
  quote?: string;
}
