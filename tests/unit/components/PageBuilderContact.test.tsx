import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import PageBuilder, { type FullPageDocument } from '@features/PageBuilder';
import type { ContactSectionBlock } from '@features/contact-section/types';
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
    const block: ContactSectionBlock = { _type: 'contactSection' };
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
          block: ContactSectionBlock;
          lang: Locale;
          mode: SiteMode;
          isEmailEnabled: boolean;
        }>;
      }>
    >;
    expect(boundary.props.children.props).toMatchObject({ block, lang, mode });
    expect(boundary.props.children.props.isEmailEnabled).toBe(false);
  });
});
