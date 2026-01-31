'use client';

import HeroSection from '@/components/page/sections/HeroSection';
import { HeroSectionBlock } from '@/types/sanity';

export default function TestHeroPage() {
  const mockHeroBlock: HeroSectionBlock = {
    _type: 'heroSection',
    _key: 'test-hero',
    title: 'Test Title',
    parallaxText: 'WE SHOOT HARD',
    backgroundMedia: [
      {
        _type: 'file',
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        mimeType: 'video/mp4',
      },
    ],
    ctas: [],
  };

  return (
    <div data-testid="test-hero-page">
      <HeroSection block={mockHeroBlock} />
    </div>
  );
}
