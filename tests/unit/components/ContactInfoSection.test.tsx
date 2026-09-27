import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ContactInfoSection from '@features/contact-info-section/components/ContactInfoSection';
import type { ContactInfoSectionBlock } from '@features/contact-info-section/types';

vi.mock('@shared/components', () => ({
  SectionShell: ({ children }: { children: ReactNode }) => (
    <section>{children}</section>
  ),
  SectionHeader: ({
    heading,
  }: {
    heading: { heading: string; body?: string };
  }) => (
    <header>
      <h2>{heading.heading}</h2>
      <p>{heading.body}</p>
    </header>
  ),
}));

vi.mock('@shared/components/common/DynamicLucideIcon', () => ({
  DynamicLucideIcon: ({ name }: { name: string }) => (
    <span data-testid='legacy-contact-icon' data-icon-name={name} />
  ),
}));

vi.mock('@shared/hooks', () => ({
  useDeviceTier: () => ({ allowHeavyMotion: false, isInitialized: true }),
}));

vi.mock('@features/contact-section/components', () => ({
  ContactForm: ({ lang }: { lang: string }) => (
    <div data-testid='contact-form' data-lang={lang} />
  ),
}));

const legacyBlock: ContactInfoSectionBlock = {
  _type: 'contactInfoSection',
  heading: { heading: 'Legacy heading', body: 'Legacy body' },
  channels: [
    {
      _key: 'email',
      label: 'Email',
      value: 'legacy@example.com',
      icon: 'Mail',
      linkUrl: 'mailto:legacy@example.com',
    },
  ],
};

describe('ContactInfoSection Phase 1 compatibility', () => {
  afterEach(cleanup);

  it('keeps rendering old channel content, links, and Lucide icons without new settings', () => {
    render(<ContactInfoSection block={legacyBlock} />);
    expect(
      screen.getByRole('heading', { name: 'Legacy heading' })
    ).toBeInTheDocument();
    expect(screen.getByText('Legacy body')).toBeInTheDocument();
    expect(screen.getByText('legacy@example.com')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'mailto:legacy@example.com'
    );
    expect(screen.getByTestId('legacy-contact-icon')).toHaveAttribute(
      'data-icon-name',
      'Mail'
    );
    expect(screen.queryByTestId('contact-form')).not.toBeInTheDocument();
  });

  it('passes the requested locale to the existing form', () => {
    render(
      <ContactInfoSection
        block={{ ...legacyBlock, showForm: true }}
        lang='th'
        mode='wedding'
      />
    );
    expect(screen.getByTestId('contact-form')).toHaveAttribute(
      'data-lang',
      'th'
    );
  });

  it('keeps the default English locale for existing callers', () => {
    render(<ContactInfoSection block={{ ...legacyBlock, showForm: true }} />);
    expect(screen.getByTestId('contact-form')).toHaveAttribute(
      'data-lang',
      'en'
    );
  });
});
