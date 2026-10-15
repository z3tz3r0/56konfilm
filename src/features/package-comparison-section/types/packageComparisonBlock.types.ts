import type { BaseBlock, ContentCta, SectionHeading } from '@shared/types';

export interface ComparisonPackage {
  _id: string;
  title?: string | null;
  price?: number | null;
  currency?: string | null;
  badgeLabel?: string | null;
  cta?: ContentCta | null;
  serviceIds?: string[] | null;
}

export interface ComparisonRow {
  _id: string;
  title?: string | null;
  information?: string | null;
}

export interface ComparisonGroup {
  _key: string;
  label: string;
  slug?: string | null;
  packages: ComparisonPackage[];
  rows: ComparisonRow[];
}

export interface PackageComparisonSectionBlock extends BaseBlock {
  _type: 'packageComparisonSection';
  heading?: SectionHeading | null;
  groups?: ComparisonGroup[] | null;
}
