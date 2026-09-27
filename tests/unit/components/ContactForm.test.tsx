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
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Wedding Date/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Venue/i)).not.toBeInTheDocument();
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
      expect(screen.getByLabelText(/^Name/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Send Message' })
      ).toHaveAttribute('type', 'submit');
      if (mode === 'wedding') {
        expect(screen.getByLabelText(/^Wedding Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Venue/i)).toBeInTheDocument();
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
    render(<ContactForm presentation='embedded' />);

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
      weddingDate: date,
      venue: 'Example venue',
    });
    await waitFor(() => expect(trigger).toHaveTextContent('Pick a date'));
    expect(trigger).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText(/^Name/i)).toHaveValue('');
  });
});
