import { ImageSource } from './sanity';

interface BaseBlock {
  _key?: string;
}

// Content Cta
type LinkType = 'internal' | 'external' | null;
type CtaStyle = 'primary' | 'secondary' | 'neutral' | 'link' | null;
interface ContentCta {
  label?: string;
  style: CtaStyle;
  linkType: LinkType;
  pageRef?: { slug?: string };
  externalUrl?: string;
}

interface MediaItem {
  _key?: string;
  image?: ImageSource;
  alt?: string;
}

interface BackgroundMediaItem {
  _key?: string;
  _type: string;
  url?: string;
  mimeType?: string;
  image?: ImageSource;
}

type AlignmentKey = 'start' | 'center' | 'end';
interface SectionHeading {
  eyebrow?: string;
  heading: string;
  body?: string;
  align?: AlignmentKey;
}

export type {
  BaseBlock,
  ContentCta,
  MediaItem,
  BackgroundMediaItem,
  AlignmentKey,
  SectionHeading,
};
