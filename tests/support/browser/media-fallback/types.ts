import type { Locale, SiteMode } from '@shared/config/preferences';

export interface FixtureOptions {
  mode?: SiteMode;
  lang?: Locale;
  mediaType?: 'image' | 'video';
  state?: 'source-missing' | 'loading' | 'success' | 'error' | 'invalid';
  frame?: boolean;
  consumer?:
    | 'project'
    | 'team'
    | 'grid'
    | 'collage'
    | 'two-column'
    | 'hero'
    | 'portable-text'
    | 'showreel'
    | 'gallery-video'
    | 'blog';
  videoAutoplay?: boolean;
  poster?: 'success' | 'loading' | 'error';
  preload?: 'none' | 'metadata' | 'auto';
  serverRendered?: boolean;
  sourceVersion?: number;
}

declare global {
  interface Window {
    showMediaFixture: (options: FixtureOptions) => void | Promise<void>;
    hydrateMediaFixture: () => void;
    mediaHydrationErrors: string[];
    mediaSourceErrors: number;
  }
}
