import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from '@/features/contact-section/components/ContactForm';
import { useMode } from '@shared/hooks';

// Mock useMode
vi.mock('@shared/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/hooks')>();
  return {
    ...actual,
    useMode: vi.fn(),
  };
});

// Mock server action
vi.mock('@/features/contact-section/actions', () => ({
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
});
