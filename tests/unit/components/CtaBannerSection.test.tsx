import { cleanup, render, screen } from '@testing-library/react';
import type { CSSProperties, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CtaBannerSection from '@features/cta-banner-section/components/CtaBannerSection';
import type { CtaBannerSectionBlock } from '@features/cta-banner-section/types';
import type { SanityColor } from '@shared/types';

vi.mock('@shared/components', () => ({
  CtaGroup: () => null,
  HighlightedText: ({ text }: { text: string }) => <h2>{text}</h2>,
  SectionShell: ({
    children,
    overlayClassName,
    overlayStyle,
  }: {
    children: ReactNode;
    overlayClassName?: string;
    overlayStyle?: CSSProperties;
  }) => (
    <section
      data-testid='cta-shell'
      data-overlay-class={overlayClassName}
      data-overlay-color={overlayStyle?.backgroundColor}
      data-overlay-opacity={overlayStyle?.opacity}
    >
      {children}
    </section>
  ),
}));

const makeBlock = (
  align?: string,
  overlay?: CtaBannerSectionBlock['overlay']
): CtaBannerSectionBlock => ({
  _type: 'ctaBannerSection',
  content: { heading: 'CTA heading', align },
  overlay,
});

describe('CtaBannerSection overlay', () => {
  afterEach(cleanup);

  it('darkens the right side for end-aligned Production text', () => {
    render(
      <CtaBannerSection block={makeBlock('end')} lang='en' mode='production' />
    );

    expect(screen.getByTestId('cta-shell')).toHaveAttribute(
      'data-overlay-class',
      'bg-linear-to-l from-midnight-black/50 from-50% to-midnight-black/0'
    );
  });

  it.each([undefined, 'start', 'center'])(
    'keeps the left-side gradient for align=%s',
    (align) => {
      render(
        <CtaBannerSection
          block={makeBlock(align)}
          lang='en'
          mode='production'
        />
      );

      expect(screen.getByTestId('cta-shell')).toHaveAttribute(
        'data-overlay-class',
        'bg-linear-to-r from-midnight-black/50 from-50% to-midnight-black/0'
      );
    }
  );

  it('keeps the Wedding default overlay', () => {
    render(
      <CtaBannerSection block={makeBlock('end')} lang='en' mode='wedding' />
    );

    expect(screen.getByTestId('cta-shell')).toHaveAttribute(
      'data-overlay-class',
      'bg-midnight-black/60'
    );
  });

  it('preserves a custom CMS overlay for end-aligned text', () => {
    const color = { hex: 'var(--color-orange)' } as SanityColor;
    render(
      <CtaBannerSection
        block={makeBlock('end', { enabled: true, color, opacity: 35 })}
        lang='en'
        mode='production'
      />
    );

    const shell = screen.getByTestId('cta-shell');
    expect(shell).not.toHaveAttribute('data-overlay-class');
    expect(shell).toHaveAttribute('data-overlay-color', 'var(--color-orange)');
    expect(shell).toHaveAttribute('data-overlay-opacity', '0.35');
  });

  it('does not render an overlay when the CMS disables it', () => {
    render(
      <CtaBannerSection
        block={makeBlock('end', { enabled: false })}
        lang='en'
        mode='production'
      />
    );

    const shell = screen.getByTestId('cta-shell');
    expect(shell).not.toHaveAttribute('data-overlay-class');
    expect(shell).not.toHaveAttribute('data-overlay-color');
  });
});
