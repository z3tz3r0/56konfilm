import { Locale, SiteMode } from '@shared/config';
import { SanityImageSource } from '@sanity/image-url';
import { UniqueSiteModesArray } from './project';

interface SanityColor {
  _type: 'color';
  hex: string;
  alpha: number;
  hsl: { h: number; s: number; l: number; a: number };
  hsv: { h: number; s: number; v: number; a: number };
  rgb: { r: number; g: number; b: number; a: number };
}

interface BasePageSlug {
  slug: string;
  _updatedAt: string;
  languages: Array<{ _key: Locale }>;
}

interface PageSlug extends BasePageSlug {
  siteMode: SiteMode;
}

interface ProjectPageSlug extends BasePageSlug {
  siteMode: UniqueSiteModesArray;
}

export type {
  SanityColor,
  SanityImageSource as ImageSource,
  PageSlug,
  ProjectPageSlug,
};
