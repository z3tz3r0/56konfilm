import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import PageBuilder, { type FullPageDocument } from '@features/PageBuilder';
import { comparisonFixture } from './packageComparison.fixtures';

vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('@features/hero-section', () => ({ HeroSection: () => null }));
vi.mock('@shared/components', () => ({ SectionErrorBoundary: () => null }));
vi.mock('@shared/config/env', () => ({ env: {} }));

describe('PageBuilder comparison context', () => {
  it.each([
    ['en', 'production'],
    ['th', 'production'],
    ['en', 'wedding'],
    ['th', 'wedding'],
  ] as const)(
    'passes %s/%s and the projected CMS block to the comparison entry',
    (lang, mode) => {
      const block = comparisonFixture(lang);
      const page: FullPageDocument = {
        title: 'Packages',
        slug: 'packages',
        siteMode: mode,
        contentBlocks: [block],
      };
      const tree = PageBuilder({ page, lang, mode });
      const [boundary] = tree.props.children as Array<
        ReactElement<{
          children: ReactElement<{
            block: unknown;
            lang: string;
            mode: string;
          }>;
        }>
      >;
      expect(boundary.props.children.props).toMatchObject({
        block,
        lang,
        mode,
      });
    }
  );
});
