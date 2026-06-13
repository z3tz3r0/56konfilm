import {
  BaseBlock,
  SectionHeading,
  ContentCta,
  ImageSource,
} from '@shared/types';

export interface BlogPost {
  _id: string;
  title?: string;
  slug?: string;
  publishedAt?: string;
  image?: ImageSource;
  excerpt?: string;
}

export interface BlogPreviewSectionBlock extends BaseBlock {
  _type: 'blogPreviewSection';
  background?: string;
  heading?: SectionHeading;
  maxPosts?: number;
  cta?: ContentCta;
}
