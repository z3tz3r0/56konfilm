import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import PageBuilder, { type FullPageDocument } from '@features/PageBuilder';

vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('@features/hero-section', () => ({ HeroSection: () => null }));
vi.mock('@shared/components', () => ({ SectionErrorBoundary: () => null }));
vi.mock('@shared/config/env', () => ({ env: {} }));

describe('PageBuilder Logo Showcase', () => {
  it.each([
    ['en', 'production'],
    ['th', 'production'],
    ['en', 'wedding'],
    ['th', 'wedding'],
  ] as const)('routes the new type and %s/%s locale context', (lang, mode) => {
    const block = {
      _type: 'logoShowcaseSection' as const,
      heading: { heading: 'CMS heading' },
      logos: [],
    };
    const page: FullPageDocument = {
      title: 'Home',
      slug: 'home',
      siteMode: mode,
      contentBlocks: [block],
    };
    const tree = PageBuilder({ page, lang, mode });
    const [boundary] = tree.props.children as Array<
      ReactElement<{ children: ReactElement<{ block: unknown; lang: string }> }>
    >;
    expect(boundary.props.children.props).toMatchObject({ block, lang });
  });
});
