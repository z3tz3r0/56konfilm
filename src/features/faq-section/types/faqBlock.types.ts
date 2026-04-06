import { BaseBlock, SectionHeading } from '@shared/types';

export interface FAQSectionBlock extends BaseBlock {
  _type: 'faqSection';
  background?: string;
  heading?: SectionHeading;
  items?: Array<{
    _key?: string;
    question?: string;
    answer?: string;
  }>;
}
