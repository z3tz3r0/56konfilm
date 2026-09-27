import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import PageBuilder, { type FullPageDocument } from '@features/PageBuilder';
import type { ContactInfoSectionBlock } from '@features/contact-info-section/types';
import type { Locale, SiteMode } from '@shared/config';

vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('@features/hero-section', () => ({ HeroSection: () => null }));
vi.mock('@shared/components', () => ({ SectionErrorBoundary: () => null }));

describe('PageBuilder contact context', () => {
  it.each([
    ['en', 'production'],
    ['th', 'production'],
    ['en', 'wedding'],
    ['th', 'wedding'],
  ] as const)('passes %s/%s to the contact section', (lang, mode) => {
    const block: ContactInfoSectionBlock = { _type: 'contactInfoSection' };
    const page: FullPageDocument = {
      title: 'Contact',
      slug: 'contact',
      siteMode: mode,
      contentBlocks: [block],
    };
    const tree = PageBuilder({ page, lang, mode });
    const [boundary] = tree.props.children as Array<
      ReactElement<{
        children: ReactElement<{
          block: ContactInfoSectionBlock;
          lang: Locale;
          mode: SiteMode;
        }>;
      }>
    >;
    expect(boundary.props.children.props).toMatchObject({ block, lang, mode });
  });
});
