import { cleanup, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ContactInfoSection from '@features/contact-info-section/components/ContactInfoSection';
import type { ContactInfoSectionBlock } from '@features/contact-info-section/types';

vi.mock('@shared/components', () => ({
  SectionShell: ({
    children,
    className,
    dataTestId,
  }: {
    children: ReactNode;
    className?: string;
    dataTestId?: string;
  }) => (
    <section className={className} data-testid={dataTestId}>
      {children}
    </section>
  ),
  AppIcon: ({
    iconName,
    variant = 'circle',
    children,
  }: {
    iconName?: string;
    variant?: string;
    children?: ReactNode;
  }) => (
    <div
      data-testid='app-icon'
      data-icon-name={iconName}
      data-variant={variant}
    >
      {children}
    </div>
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
  ContactForm: ({
    lang,
    presentation,
    submitButton,
  }: {
    lang: string;
    presentation?: string;
    submitButton?: ContactInfoSectionBlock['submitButton'];
  }) => (
    <div
      data-testid='contact-form'
      data-lang={lang}
      data-presentation={presentation}
      data-submit-label={submitButton?.label}
      data-submit-style={submitButton?.style}
      data-submit-size={submitButton?.size}
    />
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

describe('ContactInfoSection', () => {
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
    expect(screen.getByTestId('contact-form')).toHaveAttribute(
      'data-presentation',
      'embedded'
    );
  });

  it('passes the localized CMS submit configuration to the embedded form', () => {
    render(
      <ContactInfoSection
        block={{
          ...legacyBlock,
          showForm: true,
          submitButton: { label: 'คุยกับเรา', style: 'neutral', size: 'md' },
        }}
        lang='th'
      />
    );
    const form = screen.getByTestId('contact-form');
    expect(form).toHaveAttribute('data-submit-label', 'คุยกับเรา');
    expect(form).toHaveAttribute('data-submit-style', 'neutral');
    expect(form).toHaveAttribute('data-submit-size', 'md');
  });

  it('keeps the default English locale for existing callers', () => {
    render(<ContactInfoSection block={{ ...legacyBlock, showForm: true }} />);
    expect(screen.getByTestId('contact-form')).toHaveAttribute(
      'data-lang',
      'en'
    );
  });

  it('prefers the CMS-selected Iconify icon over the legacy icon', () => {
    render(
      <ContactInfoSection
        block={{
          ...legacyBlock,
          channels: [
            {
              ...legacyBlock.channels![0],
              iconPicker: { name: 'lucide:mail' },
            },
          ],
        }}
      />
    );
    expect(screen.getByTestId('app-icon')).toHaveAttribute(
      'data-icon-name',
      'lucide:mail'
    );
    expect(screen.queryByTestId('legacy-contact-icon')).not.toBeInTheDocument();
  });

  it('falls back to the legacy icon when the picker name is empty', () => {
    render(
      <ContactInfoSection
        block={{
          ...legacyBlock,
          channels: [
            { ...legacyBlock.channels![0], iconPicker: { name: ' ' } },
          ],
        }}
      />
    );
    expect(screen.getByTestId('legacy-contact-icon')).toHaveAttribute(
      'data-icon-name',
      'Mail'
    );
  });

  it('preserves actual newlines and allows long contact values to wrap', () => {
    const value = `First line\n${'long-address'.repeat(30)}`;
    render(
      <ContactInfoSection
        block={{ ...legacyBlock, channels: [{ label: 'Address', value }] }}
      />
    );
    const content = screen
      .getByTestId('contact-channel-card')
      .querySelector('p');
    expect(content?.textContent).toBe(value);
    expect(content).toHaveClass('whitespace-pre-wrap', 'wrap-anywhere');
    expect(screen.queryByTestId('app-icon')).not.toBeInTheDocument();
  });

  it.each(['production', 'wedding'] as const)(
    'uses the same responsive layout and mobile content order in %s mode',
    (mode) => {
      render(
        <ContactInfoSection
          block={{
            ...legacyBlock,
            showForm: true,
            socialHeading: 'Follow our studio',
            socialLinks: [
              {
                label: 'Instagram',
                url: 'https://www.instagram.com/example',
                icon: { name: 'mdi:instagram' },
              },
            ],
          }}
          mode={mode}
        />
      );
      expect(screen.getByTestId('contact-layout')).toHaveClass(
        'lg:grid-cols-2',
        'min-w-0'
      );
      const details = screen.getByTestId('contact-details');
      const form = screen.getByTestId('contact-form');
      const social = screen.getByTestId('contact-social');
      expect(
        details.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      expect(
        form.compareDocumentPosition(social) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      expect(within(social).getByTestId('app-icon')).toHaveAttribute(
        'data-variant',
        'plain'
      );
      expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
        'target',
        '_blank'
      );
      expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
        'rel',
        'noopener noreferrer'
      );
    }
  );

  it('renders an accessible text link when a social icon is not configured', () => {
    render(
      <ContactInfoSection
        block={{
          _type: 'contactInfoSection',
          socialLinks: [
            { label: 'Studio profile', url: 'https://example.com' },
          ],
        }}
      />
    );
    expect(
      screen.getByRole('link', { name: 'Studio profile' })
    ).toHaveTextContent('Studio profile');
    expect(screen.queryByTestId('contact-form')).not.toBeInTheDocument();
  });

  it('omits invalid or unnamed social links and does not render unsafe channel URLs', () => {
    render(
      <ContactInfoSection
        block={{
          _type: 'contactInfoSection',
          channels: [
            {
              label: 'Contact',
              value: 'Kept as plain text',
              linkUrl: 'javascript:alert(1)',
            },
          ],
          socialLinks: [
            { label: 'Unsafe', url: 'javascript:alert(1)' },
            { label: 'Missing URL' },
            { label: ' ', url: 'https://example.com' },
            { label: 'Not a profile', url: 'mailto:example@example.com' },
          ],
        }}
      />
    );
    expect(screen.getByText('Kept as plain text')).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.queryByTestId('contact-social')).not.toBeInTheDocument();
    expect(screen.queryByTestId('contact-form-social')).not.toBeInTheDocument();
  });

  it('handles an empty section without a stray zero or hardcoded content', () => {
    render(
      <ContactInfoSection
        block={{ _type: 'contactInfoSection', channels: [], socialLinks: [] }}
      />
    );
    expect(screen.getByTestId('contact-info-section')).toHaveTextContent('');
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.getByTestId('contact-layout')).not.toHaveClass(
      'lg:grid-cols-2'
    );
  });

  it('keeps mail and phone links in the current browsing context', () => {
    render(
      <ContactInfoSection
        block={{
          _type: 'contactInfoSection',
          channels: [{ label: 'Phone', value: '123', linkUrl: 'tel:123' }],
        }}
      />
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', 'tel:123');
    expect(screen.getByRole('link')).not.toHaveAttribute('target');
  });
});
