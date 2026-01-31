import { HeroSectionBlock } from '@/types/sanity';

export const createHeroSection = (overrides: Partial<HeroSectionBlock> = {}): HeroSectionBlock => ({
  _type: 'heroSection',
  _key: 'test-hero',
  parallaxText: 'WE SHOOT HARD',
  backgroundMedia: [
    {
      _type: 'file',
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      mimeType: 'video/mp4',
    },
  ],
  ctas: [],
  ...overrides,
});
