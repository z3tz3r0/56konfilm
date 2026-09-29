import { BaseBlock, SectionHeading, ContentCta } from '@shared/types';

export interface ContactSubmitButton {
  label?: string;
  style?: ContentCta['style'];
  size?: 'default' | 'sm' | 'md' | 'lg';
}

export interface ContactSectionBlock extends BaseBlock {
  _type: 'contactInfoSection';
  background?: string;
  heading?: SectionHeading;
  showForm?: boolean;
  channels?: Array<{
    _key?: string;
    label?: string;
    value?: string;
    icon?: string;
    iconPicker?: { name: string };
    linkUrl?: string;
  }>;
  socialHeading?: string;
  socialLinks?: Array<{
    _key?: string;
    label?: string;
    url?: string;
    icon?: { name: string };
  }>;
  submitButton?: ContactSubmitButton;
  map?: {
    embedUrl?: string;
    title?: string;
  };
  cta?: ContentCta;
}
