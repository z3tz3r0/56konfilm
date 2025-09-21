import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface I18nArrayItem<T> {
  _key: string;
  value: T;
}

// --- Raw Data from Sanity ---
export interface RawProject {
  _id: string;
  title: I18nArrayItem<string>[];
  overview: I18nArrayItem<string>[];
  siteMode: 'production' | 'wedding';
  slug: { current: string };
  coverImage: SanityImageSource;
}

// --- Data after resolving language in GROQ ---
export interface Project {
  _id: string;
  title: string;
  overview: string;
  siteMode: ('production' | 'wedding')[];
  slug: string;
  coverImage: SanityImageSource;
}
