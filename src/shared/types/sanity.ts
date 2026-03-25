import { Locale, SiteMode } from '@shared/config';
import { SanityImageSource } from '@sanity/image-url';

interface SanityColor {
  _type: 'color';
  hex: string;
  alpha: number;
  hsl: { h: number; s: number; l: number; a: number };
  hsv: { h: number; s: number; v: number; a: number };
  rgb: { r: number; g: number; b: number; a: number };
}

interface PageSlugs {
  slug: string;
  siteMode: SiteMode;
  _updatedAt: string;
  languages: Array<{ _key: Locale }>;
}

export type { SanityColor, SanityImageSource as ImageSource, PageSlugs };
