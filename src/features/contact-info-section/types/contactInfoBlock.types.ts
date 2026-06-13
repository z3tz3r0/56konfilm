import { BaseBlock, SectionHeading, ContentCta } from '@shared/types';

export interface ContactInfoSectionBlock extends BaseBlock {
  _type: 'contactInfoSection';
  background?: string;
  heading?: SectionHeading;
  showForm?: boolean;
  channels?: Array<{
    _key?: string;
    label?: string;
    value?: string;
    icon?: string;
    linkUrl?: string;
  }>;
  cta?: ContentCta;
}
