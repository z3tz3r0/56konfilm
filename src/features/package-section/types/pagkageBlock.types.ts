import { BaseBlock, ContentCta } from '@shared/types';

export interface PackagesSectionBlock extends BaseBlock {
  _type: 'packagesSection';
  background?: string;
  heading?: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    align?: string;
  };
  packages?: Array<{
    _key?: string;
    title?: string;
    price?: number;
    currency?: string;
    features?: string[];
    featured?: boolean;
    cta?: ContentCta;
  }>;
}
