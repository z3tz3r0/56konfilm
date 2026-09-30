import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from '@features/contact-section/components/ContactForm';
import { useMode } from '@shared/hooks';
import { submitContactForm } from '@features/contact-section/actions';

// Mock useMode
vi.mock('@shared/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/hooks')>();
  return {
    ...actual,
    useMode: vi.fn(),
  };
});

// Mock server action
vi.mock('@features/contact-section/actions', () => ({
  submitContactForm: vi.fn(),
}));

// Mock ResizeObserver for Framer Motion or Layout functionality
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('ContactForm Component', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders commercial fields in commercial mode', () => {
    (useMode as any).mockReturnValue({ mode: 'commercial' });
    render(<ContactForm />);

    // Header check - based on ContactHeader implementation which we should check
    // If it's commercial mode, it should show commercial header
    expect(screen.getByText(/Commercial Inquiry/i)).toBeInTheDocument();

    // Fields check
    expect(screen.getByLabelText(/^Name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Surname')).toHaveAttribute(
      'aria-required',
      'true'
    );
    expect(screen.queryByLabelText(/Wedding Date/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Venue/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Message sending is not available yet.'
    );
  });

  it('renders wedding fields in wedding mode', () => {
    (useMode as any).mockReturnValue({ mode: 'wedding' });
    render(<ContactForm />);

    // Header check
    expect(screen.getByText(/Tell us your love story/i)).toBeInTheDocument();

    // Fields check
    expect(screen.getByLabelText(/Wedding Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Venue/i)).toBeInTheDocument();
  });

  it('explains the disabled state in Thai without submitting', () => {
    vi.mocked(useMode).mockReturnValue({ mode: 'production' } as ReturnType<
      typeof useMode
    >);
    render(<ContactForm lang='th' />);
    expect(screen.getByRole('button', { name: 'ส่งข้อความ' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'ขณะนี้ยังส่งข้อความผ่านฟอร์มไม่ได้'
    );
    expect(submitContactForm).not.toHaveBeenCalled();
  });

  it.each(['production', 'wedding'])(
    'embeds the existing %s form without a duplicate heading or wrapper spacing',
    (mode) => {
      vi.mocked(useMode).mockReturnValue({ mode } as ReturnType<
        typeof useMode
      >);
      render(<ContactForm presentation='embedded' lang='th' />);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByTestId('contact-form')).toHaveAttribute(
        'data-presentation',
        'embedded'
      );
      expect(screen.getByTestId('contact-form')).not.toHaveClass(
        'max-w-lg',
        'p-4',
        'md:p-8'
      );
      expect(screen.getByLabelText('ชื่อ')).toBeInTheDocument();
      expect(screen.getByLabelText('นามสกุล')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'ส่งข้อความ' })
      ).toHaveAttribute('type', 'submit');
      if (mode === 'wedding') {
        expect(screen.getByLabelText('วันแต่งงาน')).toBeInTheDocument();
        expect(screen.getByLabelText('สถานที่จัดงาน')).toBeInTheDocument();
      }
    }
  );

  it('retains standalone wrapper spacing by default', () => {
    vi.mocked(useMode).mockReturnValue({ mode: 'production' } as ReturnType<
      typeof useMode
    >);
    render(<ContactForm />);
    expect(screen.getByTestId('contact-form')).toHaveAttribute(
      'data-presentation',
      'standalone'
    );
    expect(screen.getByTestId('contact-form')).toHaveClass(
      'mx-auto',
      'max-w-lg',
      'p-4',
      'md:p-8'
    );
    expect(
      screen.getByRole('heading', { name: 'Commercial Inquiry' })
    ).toBeInTheDocument();
  });

  it('revalidates a selected wedding date and resets it after successful submission', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2050, 6, 20, 12));
    vi.mocked(useMode).mockReturnValue({ mode: 'wedding' } as ReturnType<
      typeof useMode
    >);
    vi.mocked(submitContactForm).mockResolvedValue({
      success: true,
      message: 'Received',
    });
    render(<ContactForm presentation='embedded' isEmailEnabled />);

    const trigger = screen.getByLabelText(/^Wedding Date/i);
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    fireEvent.blur(trigger);
    await screen.findByText('Please select your wedding date.');
    const date = new Date(2050, 6, 21);
    const day = dialog.querySelector<HTMLButtonElement>(
      `button[data-day="${date.toLocaleDateString()}"]`
    );
    expect(day).not.toBeNull();
    fireEvent.click(day!);
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-invalid', 'false')
    );
    expect(
      screen.queryByText('Please select your wedding date.')
    ).not.toBeInTheDocument();
    expect(submitContactForm).not.toHaveBeenCalled();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );

    fireEvent.change(screen.getByLabelText(/^Name/i), {
      target: { value: 'Example couple' },
    });
    fireEvent.change(screen.getByLabelText('Surname'), {
      target: { value: '  Example  ' },
    });
    fireEvent.change(screen.getByLabelText(/^Email/i), {
      target: { value: 'example@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Venue/i), {
      target: { value: 'Example venue' },
    });
    fireEvent.change(screen.getByLabelText(/^Message/i), {
      target: { value: 'A detailed wedding inquiry' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
    await waitFor(() => expect(submitContactForm).toHaveBeenCalledOnce());
    expect(vi.mocked(submitContactForm).mock.calls[0][0]).toMatchObject({
      type: 'wedding',
      surname: 'Example',
      weddingDate: '2050-07-21',
      venue: 'Example venue',
    });
    await waitFor(() => expect(trigger).toHaveTextContent('Pick a date'));
    expect(trigger).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText(/^Name/i)).toHaveValue('');
    expect(screen.getByLabelText('Surname')).toHaveValue('');
  });

  it.each(['production', 'wedding'] as const)(
    'blocks a whitespace-only surname in %s mode',
    async (mode) => {
      vi.mocked(useMode).mockReturnValue({ mode } as ReturnType<
        typeof useMode
      >);
      render(<ContactForm presentation='embedded' isEmailEnabled />);
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'Example' },
      });
      fireEvent.change(screen.getByLabelText('Surname'), {
        target: { value: '   ' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'example@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Message'), {
        target: { value: 'A detailed project inquiry' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
      await screen.findByText('Please enter your surname.');
      expect(screen.getByLabelText('Surname')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
      expect(submitContactForm).not.toHaveBeenCalled();
    }
  );

  it.each(['en', 'th'] as const)(
    'localizes form labels, placeholders, and default submit text in %s',
    (lang) => {
      vi.mocked(useMode).mockReturnValue({ mode: 'wedding' } as ReturnType<
        typeof useMode
      >);
      render(<ContactForm lang={lang} presentation='embedded' />);
      const labels =
        lang === 'th'
          ? [
              'ชื่อ',
              'นามสกุล',
              'อีเมล',
              'ข้อความ',
              'วันแต่งงาน',
              'สถานที่จัดงาน',
            ]
          : ['Name', 'Surname', 'Email', 'Message', 'Wedding Date', 'Venue'];
      for (const label of labels) {
        const input = screen.getByLabelText(label);
        expect(document.querySelector(`label[for="${input.id}"]`)).toHaveClass(
          'text-text-primary'
        );
      }
      expect(screen.getByLabelText(labels[0])).toHaveAttribute(
        'placeholder',
        lang === 'th' ? 'ชื่อของคุณ' : 'Your first name'
      );
      expect(screen.getByLabelText(labels[1])).toHaveAttribute(
        'placeholder',
        lang === 'th' ? 'นามสกุลของคุณ' : 'Your surname'
      );
      expect(screen.getByLabelText(labels[3])).toHaveAttribute(
        'placeholder',
        lang === 'th'
          ? 'เล่าให้เราฟังเกี่ยวกับวันสำคัญของคุณ…'
          : 'Tell us about your day…'
      );
      expect(screen.getByLabelText(labels[5])).toHaveAttribute(
        'placeholder',
        lang === 'th'
          ? 'เมือง ประเทศ หรือชื่อสถานที่จัดงาน'
          : 'City, Country or Venue Name'
      );
      expect(
        screen.getByRole('button', {
          name: lang === 'th' ? 'ส่งข้อความ' : 'Send Message',
        })
      ).toHaveAttribute('data-variant', 'default');
    }
  );

  it.each([
    ['primary', 'default', 'default'],
    ['secondary', 'secondary', 'sm'],
    ['neutral', 'neutral', 'md'],
    ['link', 'link', 'lg'],
  ] as const)(
    'uses CMS style %s and size %s without turning Submit into a link',
    (style, variant, size) => {
      vi.mocked(useMode).mockReturnValue({ mode: 'production' } as ReturnType<
        typeof useMode
      >);
      render(
        <ContactForm
          presentation='embedded'
          submitButton={{ label: 'Let’s discuss', style, size }}
        />
      );
      const button = screen.getByRole('button', { name: 'Let’s discuss' });
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('data-variant', variant);
      expect(button).toHaveAttribute('data-size', size);
      expect(button).toHaveClass(
        'self-center',
        'lg:self-start',
        'max-w-full',
        'whitespace-normal'
      );
      expect(button).not.toHaveClass('w-full');
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    }
  );

  it('falls back to localized defaults for an empty CMS label', () => {
    vi.mocked(useMode).mockReturnValue({ mode: 'production' } as ReturnType<
      typeof useMode
    >);
    render(<ContactForm lang='th' submitButton={{ label: '   ' }} />);
    const button = screen.getByRole('button', { name: 'ส่งข้อความ' });
    expect(button).toHaveAttribute('data-size', 'default');
    expect(button).toHaveAttribute('data-variant', 'default');
    expect(button).toHaveClass('w-full');
  });

  it.each(['en', 'th'] as const)(
    'keeps the %s submit button disabled while pending, then resets surname',
    async (lang) => {
      vi.mocked(useMode).mockReturnValue({ mode: 'production' } as ReturnType<
        typeof useMode
      >);
      let finish!: (result: { success: boolean; message: string }) => void;
      vi.mocked(submitContactForm).mockReturnValue(
        new Promise((resolve) => {
          finish = resolve;
        })
      );
      render(
        <ContactForm
          lang={lang}
          isEmailEnabled
          submitButton={{ label: 'CMS submit', style: 'secondary', size: 'lg' }}
        />
      );
      const labels =
        lang === 'th'
          ? ['ชื่อ', 'นามสกุล', 'อีเมล', 'ข้อความ']
          : ['Name', 'Surname', 'Email', 'Message'];
      for (const [index, value] of [
        'Example',
        '  Family  ',
        'example@example.com',
        'A detailed project inquiry',
      ].entries()) {
        fireEvent.change(screen.getByLabelText(labels[index]), {
          target: { value },
        });
      }
      fireEvent.click(screen.getByRole('button', { name: 'CMS submit' }));
      const pending = await screen.findByRole('button', {
        name: lang === 'th' ? 'กำลังส่ง...' : 'Sending...',
      });
      expect(pending).toBeDisabled();
      expect(pending).toHaveAttribute('aria-busy', 'true');
      expect(pending).toHaveAttribute('data-variant', 'secondary');
      expect(pending).toHaveAttribute('data-size', 'lg');
      expect(submitContactForm).toHaveBeenCalledOnce();
      expect(vi.mocked(submitContactForm).mock.calls[0][0]).toMatchObject({
        type: 'commercial',
        surname: 'Family',
      });
      finish({ success: true, message: 'Received' });
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'CMS submit' })).toBeEnabled()
      );
      for (const label of labels)
        expect(screen.getByLabelText(label)).toHaveValue('');
    }
  );

  it('retains entered data when the email action fails', async () => {
    vi.mocked(useMode).mockReturnValue({ mode: 'production' } as ReturnType<
      typeof useMode
    >);
    vi.mocked(submitContactForm).mockResolvedValue({
      success: false,
      message: 'Try again',
    });
    render(<ContactForm isEmailEnabled />);
    for (const [label, value] of [
      ['Name', 'Example'],
      ['Surname', 'Family'],
      ['Email', 'example@example.com'],
      ['Message', 'A detailed project inquiry'],
    ]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
    await waitFor(() => expect(submitContactForm).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Send Message' })).toBeEnabled()
    );
    expect(screen.getByLabelText('Surname')).toHaveValue('Family');
  });

  it('keeps surname when changing modes and clears wedding-only errors for production', async () => {
    vi.mocked(useMode).mockReturnValue({ mode: 'wedding' } as ReturnType<
      typeof useMode
    >);
    vi.mocked(submitContactForm).mockResolvedValue({
      success: true,
      message: 'Received',
    });
    const { rerender } = render(
      <ContactForm presentation='embedded' isEmailEnabled />
    );
    for (const [label, value] of [
      ['Name', 'Example'],
      ['Surname', 'Family'],
      ['Email', 'example@example.com'],
      ['Message', 'A detailed project inquiry'],
    ]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
    await screen.findByText('Please select your wedding date.');
    await screen.findByText('Venue is required');
    expect(submitContactForm).not.toHaveBeenCalled();

    vi.mocked(useMode).mockReturnValue({ mode: 'production' } as ReturnType<
      typeof useMode
    >);
    rerender(<ContactForm presentation='embedded' isEmailEnabled />);
    await waitFor(() =>
      expect(
        screen.queryByText('Please select your wedding date.')
      ).not.toBeInTheDocument()
    );
    expect(screen.queryByText('Venue is required')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Surname')).toHaveValue('Family');
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
    await waitFor(() => expect(submitContactForm).toHaveBeenCalledOnce());
    expect(vi.mocked(submitContactForm).mock.calls[0][0]).toMatchObject({
      type: 'commercial',
      surname: 'Family',
    });
    await waitFor(() =>
      expect(screen.getByLabelText('Surname')).toHaveValue('')
    );
  });
});
