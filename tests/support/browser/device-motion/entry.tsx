import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionProvider } from '@shared/providers/MotionProvider';
import { useDeviceTier } from '@shared/hooks/useDeviceTier';
import AnimatedPortfolioGrid from '@shared/components/common/portfolio-grid/AnimatedPortfolioGrid';
import AnimatedCollageImage from '@features/media-gallery-section/components/collage/AnimatedCollageImage';
import StatsCounterSection from '@features/stats-counter-section/components/StatsCounterSection';
import VideoLoop from '@shared/components/common/VideoLoop';
import VideoItem from '@features/media-gallery-section/components/grid/VideoItem';

function Project({ name }: { name: string }) {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((value) => value + 1)}>
      {name}: {count}
    </button>
  );
}

function Fixture() {
  const tier = useDeviceTier();
  return (
    <MotionProvider>
      <div style={{ height: 160 }} />
      <output data-testid='tier'>{JSON.stringify(tier)}</output>
      <AnimatedPortfolioGrid className='portfolio-grid'>
        <Project key='first' name='First project' />
        <Project key='second' name='Second project' />
      </AnimatedPortfolioGrid>
      <AnimatedCollageImage className='collage' order={0}>
        <Project name='Collage project' />
      </AnimatedCollageImage>
      <div className='video-frame'>
        <VideoLoop url='data:video/mp4;base64,' />
      </div>
      <div className='video-frame'>
        <VideoItem src='data:video/mp4;base64,' />
      </div>
      <div style={{ height: 1400 }} />
      <StatsCounterSection
        block={{
          _type: 'statsCounterSection',
          stats: [{ _key: 'projects', value: '100', label: 'Projects' }],
        }}
      />
      <div style={{ height: 400 }} />
    </MotionProvider>
  );
}

const fixtureWindow = window as typeof window & {
  showDeviceMotionFixture: () => void;
};
fixtureWindow.showDeviceMotionFixture = () => {
  createRoot(document.getElementById('root')!).render(<Fixture />);
};
