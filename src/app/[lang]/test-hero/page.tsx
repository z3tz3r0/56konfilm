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
        _type: 'backgroundVideo',
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        mimeType: 'video/mp4',
      },
      {
        _type: 'image',
        _key: 'poster-img',
        url: 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?q=80&w=2604&auto=format&fit=crop',
        image: {
          asset: {
            _ref: 'image-0000000000000000000000000000000000000000-1920x1080-jpg',
            _type: 'reference'
          }
        }
      }
    ],
    ctas: [],
  };

  return (
    <div data-testid="test-hero-page">
      <HeroSection block={mockHeroBlock} />
    </div>
  );
}
