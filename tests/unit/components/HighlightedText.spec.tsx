import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import HighlightedText from '@shared/components/common/HighlightedText';
import SectionHeader from '@shared/components/common/section-header';
import EmphasizedHeader from '@shared/components/common/section-header/EmphasizedHeader';

afterEach(cleanup);

describe('Shared HighlightedText regression', () => {
  it.each([
    ['Plain text', 'Plain text', 0],
    ['[First] and [second]', 'First and second', 2],
    ['[ทุกผลงาน] สำคัญ', 'ทุกผลงาน สำคัญ', 1],
    ['[First line]\nSecond line', 'First line\nSecond line', 1],
    ['An unmatched [bracket', 'An unmatched [bracket', 0],
    ['<script>alert(1)</script>', '<script>alert(1)</script>', 0],
  ] as const)('preserves existing parsing for %s', (text, expected, count) => {
    render(<HighlightedText text={text} className='fixture-heading' />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBe(expected);
    expect(heading).toHaveClass('fixture-heading');
    expect(heading.querySelectorAll('span.dark\\:text-primary')).toHaveLength(
      count
    );
    expect(heading.querySelector('script')).toBeNull();
  });
  it('keeps empty text empty', () => {
    const { container } = render(
      <HighlightedText text='' className='fixture-heading' />
    );
    expect(container).toBeEmptyDOMElement();
  });
  it('preserves SectionHeader typography and Production-only highlight classes', () => {
    render(
      <SectionHeader
        heading={{
          eyebrow: 'CMS eyebrow',
          heading: '[CMS] heading',
          body: 'CMS body',
        }}
      />
    );
    expect(screen.getByRole('heading')).toHaveClass('text-3xl', 'md:text-4xl');
    expect(screen.getByText('CMS')).toHaveClass('dark:text-primary');
    expect(screen.getByText('CMS eyebrow')).toBeInTheDocument();
    expect(screen.getByText('CMS body')).toBeInTheDocument();
  });
  it('preserves EmphasizedHeader rendering', () => {
    render(<EmphasizedHeader heading='An [emphasized] heading' />);
    expect(screen.getByRole('heading')).toHaveClass('text-4xl', 'md:text-5xl');
    expect(screen.getByText('emphasized')).toHaveClass('dark:text-primary');
  });
});
