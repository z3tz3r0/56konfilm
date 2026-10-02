import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AnimatedCollageImage from '@features/media-gallery-section/components/collage/AnimatedCollageImage';

const mocks = vi.hoisted(() => ({
  useDeviceTier: vi.fn(),
  motionDiv: vi.fn(),
}));

vi.mock('@shared/hooks', () => ({ useDeviceTier: mocks.useDeviceTier }));
vi.mock('motion/react', () => ({
  m: {
    div: ({ children, ...props }: { children: ReactNode }) => {
      mocks.motionDiv(props);
      return <div data-testid='motion-image'>{children}</div>;
    },
  },
}));

describe('AnimatedCollageImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useDeviceTier.mockReturnValue({
      isInitialized: true,
      allowHeavyMotion: true,
    });
  });
  afterEach(cleanup);

  it('reveals images once with the shared stagger timing', () => {
    render(
      <AnimatedCollageImage className='frame' order={2}>
        Image content
      </AnimatedCollageImage>
    );

    expect(screen.getByTestId('motion-image')).toHaveTextContent(
      'Image content'
    );
    expect(mocks.motionDiv).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'frame',
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, margin: '-100px' },
        variants: {
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut', delay: 0.4 },
          },
        },
      })
    );
  });

  it('renders content without motion after a low-tier device is initialized', () => {
    mocks.useDeviceTier.mockReturnValue({
      isInitialized: true,
      allowHeavyMotion: false,
    });

    render(
      <AnimatedCollageImage className='frame' order={0}>
        Image content
      </AnimatedCollageImage>
    );

    expect(screen.getByText('Image content')).toHaveClass('frame');
    expect(screen.queryByTestId('motion-image')).toBeNull();
    expect(mocks.motionDiv).not.toHaveBeenCalled();
  });
});
